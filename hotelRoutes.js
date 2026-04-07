const express = require("express");
const router = express.Router();

const hotelController = require('../controllers/hotelController');

router.post("/", hotelController.criar);
router.get("/", hotelController.listar);
router.put("/:id", hotelController.atualizar);
router.delete("/:id", hotelController.deletar);

module.exports = router;
