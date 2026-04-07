const db = require("../config/database");

async function buscarItensDoPedido(connection, vendaId) {
    const query = `
        SELECT
            v.id AS pedido,
            v.data_venda,
            p.nome AS produto,
            p.id AS produto_id,
            iv.quantidade,
            iv.preco_unitario,
            (iv.quantidade * iv.preco_unitario) AS subtotal
        FROM itens_vendas iv
        JOIN vendas v ON iv.venda_id = v.id
        JOIN produtos p ON iv.produto_id = p.id
        WHERE v.id = ?;
    `;

    const [rows] = await connection.query(query, [Number(vendaId)]);
    return rows;
}

function normalizarItens(body) {
    const itensRecebidos = Array.isArray(body.itens) ? body.itens : body.produtosParaVender;

    if (!Array.isArray(itensRecebidos) || itensRecebidos.length === 0) {
        return { erro: "Envie 'itens' como array com pelo menos 1 item.", itens: null };
    }

    const itens = itensRecebidos.map((item) => ({
        produto_id: Number(item.produto_id),
        quantidade: Number(item.quantidade)
    }));

    const itensInvalidos = itens.filter((item) => {
        const produtoIdValido = Number.isInteger(item.produto_id) && item.produto_id > 0;
        const quantidadeValida = Number.isInteger(item.quantidade) && item.quantidade > 0;
        return !(produtoIdValido && quantidadeValida);
    });

    if (itensInvalidos.length > 0) {
        return {
            erro: "Cada item precisa de produto_id (int) e quantidade (int), ambos > 0.",
            itens: null
        };
    }

    return { erro: null, itens };
}

const pedidosController = {
    criarPedidoVenda: async (req, res) => {
        const { erro, itens } = normalizarItens(req.body);
        if (erro) {
            return res.status(400).json({
                erro
            });
        }

        const connection = await db.getConnection();

        try {
            const produtoIds = [...new Set(itens.map((item) => item.produto_id))];
            const placeholders = produtoIds.map(() => "?").join(", ");
            const [produtosEncontrados] = await connection.query(
                `SELECT id, preco FROM produtos WHERE id IN (${placeholders})`,
                produtoIds
            );

            const produtosMap = new Map(
                produtosEncontrados.map((produto) => [Number(produto.id), Number(produto.preco)])
            );
            const produtosInexistentes = produtoIds.filter((id) => !produtosMap.has(id));

            if (produtosInexistentes.length > 0) {
                return res.status(400).json({
                    erro: "Um ou mais produtos informados nao existem.",
                    produtos_inexistentes: produtosInexistentes
                });
            }

            await connection.beginTransaction();

            const totalVenda = itens.reduce((acc, item) => {
                const preco = produtosMap.get(item.produto_id);
                return acc + (item.quantidade * preco);
            }, 0);

            const [vendaResult] = await connection.query(
                "INSERT INTO vendas (total) VALUES (?)",
                [totalVenda]
            );

            const vendaId = vendaResult.insertId;

            const itensPromises = itens.map((item) => {
                const preco = produtosMap.get(item.produto_id);
                return connection.query(
                    "INSERT INTO itens_vendas (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
                    [vendaId, item.produto_id, item.quantidade, preco]
                );
            });

            await Promise.all(itensPromises);
            await connection.commit();

            const resumo = await buscarItensDoPedido(connection, vendaId);

            return res.status(201).json({
                mensagem: "Pedido criado com sucesso!",
                venda_id: vendaId,
                total: Number(totalVenda.toFixed(2)),
                itens: resumo
            });
        } catch (error) {
            try {
                await connection.rollback();
            } catch (_) {
                // Ignora rollback quando a transacao nao foi iniciada.
            }

            if (error && error.code) {
                // Evita mensagem generica para casos comuns de dados invalidos.
                if (error.code === "ER_NO_REFERENCED_ROW_2") {
                    return res.status(400).json({
                        erro: "Produto informado nao existe."
                    });
                }
            }

            return res.status(500).json({
                erro: "Erro ao processar venda. Transacao desfeita.",
                detalhe: error.message
            });
        } finally {
            connection.release();
        }
    },

    listarPedidos: async (_req, res) => {
        try {
            const [rows] = await db.query(
                "SELECT id AS pedido, data_venda, total FROM vendas ORDER BY id DESC"
            );

            return res.json(rows);
        } catch (error) {
            return res.status(500).json({
                erro: "Erro ao listar pedidos.",
                detalhe: error.message
            });
        }
    },

    buscarPedidoPorId: async (req, res) => {
        const pedidoId = Number(req.params.id);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ erro: "ID do pedido invalido." });
        }

        const connection = await db.getConnection();
        try {
            const [pedidoRows] = await connection.query(
                "SELECT id AS pedido, data_venda, total FROM vendas WHERE id = ?",
                [pedidoId]
            );

            if (pedidoRows.length === 0) {
                return res.status(404).json({ erro: "Pedido nao encontrado." });
            }

            const itens = await buscarItensDoPedido(connection, pedidoId);
            return res.json({
                ...pedidoRows[0],
                itens
            });
        } catch (error) {
            return res.status(500).json({
                erro: "Erro ao buscar pedido.",
                detalhe: error.message
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = pedidosController;
