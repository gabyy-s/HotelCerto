const express = require("express");
const router = express.Router();

const pedidosController = require("../controllers/pedidosController");

router.post("/", pedidosController.criarPedidoVenda);
router.get("/", pedidosController.listarPedidos);
router.get("/:id", pedidosController.buscarPedidoPorId);

module.exports = router;
