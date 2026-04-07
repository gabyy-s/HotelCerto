require("dotenv").config();

const express = require("express");
const cors = require("cors");

const HotelRoutes = require("./src/routes/hotelRoutes");
const PedidosRoutes = require("./src/routes/pedidosRoutes");
const ProdutosRoutes = require("./src/routes/produtosRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/hotel", HotelRoutes);
app.use("/pedidos", PedidosRoutes);
app.use("/produtos", ProdutosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
