const express = require('express')
const router = express.Router()
const db = require('../database/db')

// Criar reserva
router.post('/', async (req, res) => {
    try {
        const { usuario_id, data_entrada, data_saida, status } = req.body

        await db.query(
            'INSERT INTO reservas (usuario_id, data_entrada, data_saida, status) VALUES (?, ?, ?, ?)',
            [usuario_id, data_entrada, data_saida, status]
        )

        res.send('Reserva criada')
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Listar reservas
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM reservas')
        res.json(result)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Atualizar status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        await db.query(
            'UPDATE reservas SET status=? WHERE id=?',
            [status, id]
        )

        res.send('Status atualizado')
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Deletar reserva
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        await db.query(
            'DELETE FROM reservas WHERE id=?',
            [id]
        )

        res.send('Reserva deletada')
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Adicionar item
router.post('/itens', async (req, res) => {
    try {
        const { reserva_id, servico_id, quantidade } = req.body

        await db.query(
            'INSERT INTO itens_reserva (reserva_id, servico_id, quantidade) VALUES (?, ?, ?)',
            [reserva_id, servico_id, quantidade]
        )

        res.send('Item adicionado')
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Remover item
router.delete('/itens/:id', async (req, res) => {
    try {
        const { id } = req.params

        await db.query(
            'DELETE FROM itens_reserva WHERE id=?',
            [id]
        )

        res.send('Item removido')
    } catch (err) {
        res.status(500).send(err.message)
    }
})

module.exports = router