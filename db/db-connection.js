const dotenv = require("dotenv");
dotenv.config();
const mysql2 = require("mysql2");

class ConexionDB {
  constructor() {
    this.db = mysql2.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
    });

    this.checkConnection();
  }

  checkConnection = () => {
    console.log("Chequeando...");
    return new Promise((resolve, reject) => {
      this.db.getConnection((error, connection) => {
        if (error) {
          console.log("Error de BD", error.code);
          reject(error.code);
        }
        if (connection) {
          console.log("Conexión establecida");
          connection.release();
          // resolve(connection.state);
          resolve("connected");
        }
      });
    });
  };
}

module.exports = new ConexionDB();