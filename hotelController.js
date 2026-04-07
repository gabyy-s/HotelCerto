const db = require('../config/database');

const HotelController = {

    // Criar serviço
    criar: async (req, res) => {
        try {
            const { nome, preco } = req.body;

            await db.query(
                'INSERT INTO servicos (nome, preco) VALUES (?, ?)',
                [nome, preco]
            );

            res.send('Serviço criado');
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    // Listar serviços
    listar: async (req, res) => {
        try {
            const [result] = await db.query('SELECT * FROM servicos');
            res.json(result);
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    // Atualizar serviço
    atualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, preco } = req.body;

            await db.query(
                'UPDATE servicos SET nome=?, preco=? WHERE id=?',
                [nome, preco, id]
            );

            res.send('Atualizado');
        } catch (err) {
            res.status(500).send(err.message);
        }
    },

    // Deletar serviço
    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            await db.query(
                'DELETE FROM servicos WHERE id=?',
                [id]
            );

            res.send('Deletado');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
};

module.exports = HotelController;
