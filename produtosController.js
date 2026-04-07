const db = require("../config/database");

const produtosController = {
    criar: async (req, res) => {
        try {
            const { nome, preco } = req.body;

            if (!nome || typeof nome !== "string" || !nome.trim()) {
                return res.status(400).json({ erro: "Nome do produto e obrigatorio." });
            }

            const precoNumero = Number(preco);
            if (!Number.isFinite(precoNumero) || precoNumero <= 0) {
                return res.status(400).json({ erro: "Preco deve ser um numero maior que zero." });
            }

            const [result] = await db.query(
                "INSERT INTO produtos (nome, preco) VALUES (?, ?)",
                [nome.trim(), precoNumero]
            );

            return res.status(201).json({
                mensagem: "Produto criado com sucesso.",
                produto: {
                    id: result.insertId,
                    nome: nome.trim(),
                    preco: precoNumero
                }
            });
        } catch (error) {
            return res.status(500).json({
                erro: "Erro ao criar produto.",
                detalhe: error.message
            });
        }
    },

    listar: async (_req, res) => {
        try {
            const [rows] = await db.query("SELECT id, nome, preco FROM produtos ORDER BY id");
            return res.json(rows);
        } catch (error) {
            return res.status(500).json({
                erro: "Erro ao listar produtos.",
                detalhe: error.message
            });
        }
    }
};

module.exports = produtosController;
