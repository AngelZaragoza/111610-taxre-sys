const dotenv = require("dotenv");
dotenv.config();
const mysql2 = require("mysql2");

class ConexionDB {
  constructor() {
    this.db = mysql2.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE, //,
    });

    this.checkConnection().catch((err) => {
      console.log("BD Error:", err.code, err);
    });
  }

  checkConnection = async () => {
    console.log("Chequeando...");
    try {
      return new Promise((resolve, reject) => {
        this.db.getConnection((error, connection) => {
          if (error) {
            // console.log("Error de BD", error.code);
            reject(error);
          }
          if (connection) {
            console.log("Conexión establecida");
            connection.release();
            resolve(connection);
          }
        });
      });
    } catch (err) {
      console.log("Code:", err.code, "Status:", err.status);
    }
  };

  /*
  getConnection = async () => {
    console.log("Obteniendo...");
    return new Promise((resolve, reject) => {
      this.db.getConnection((error, connection) => {
        if (error) {
          console.log("Error de BD", error.code);
          reject(error.code);
        }
        if (connection) {
          console.log("Obtenido...");
          // connection.release();
          resolve(connection);
        }
      });
    }).catch(err => {
      throw err;
    });
  };
  */

  //Para ejecutar todas las consultas y procedimientos almacenados
  query = async (sql, values) => {
    return new Promise((resolve, reject) => {
      const callback = (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      };
      // .execute utiliza Prepared Statements (más eficiente)
      this.db.execute(sql, values, callback);
    }).catch((err) => {
      const mysqlErrorList = Object.keys(HttpStatusCodes);
      // Convierte los errores de mysql a codigos de estado http
      err.status = mysqlErrorList.includes(err.code)
        ? HttpStatusCodes[err.code]
        : err.status;

      throw err;
    });
  };
}

// like ENUM
const HttpStatusCodes = Object.freeze({
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
  ER_DUP_ENTRY: 409,
});

module.exports = new ConexionDB();
