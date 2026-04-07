require('dotenv').config();
const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const conn = await connection.getConnection();
        console.log("Banco de dados conectado com sucesso!");
        conn.release();
    } catch (error) {
        console.error("Erro ao conectar no banco:", error);
    }
}

testConnection();

module.exports = connection;