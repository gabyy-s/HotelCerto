const db = require("../config/database");

const Hotel = {
    buscarUsuario: async (email) => {
        const sql = "SELECT * FROM usuarios WHERE email = ?";
        
        const [rows] = await db.query(sql, [email]);

        return rows[0];
    }
};

module.exports = Hotel;