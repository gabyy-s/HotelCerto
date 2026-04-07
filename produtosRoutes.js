const express = require("express");
const router = express.Router();

const produtosController = require("../controllers/produtosController");

router.post("/", produtosController.criar);
router.get("/", produtosController.listar);

module.exports = router;
