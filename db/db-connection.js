const dotenv = require("dotenv");
dotenv.config();
const mysql2 = require("mysql2");
const HttpException = require("../lib/httpexception.utils");

class ConexionDB {
  constructor() {
    this.db = mysql2.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE, //,
    });

    //Codigo original
    // ---------------------------------------
    // this.checkConnection().catch((err) => {
    //   console.log("BD Error:", err.code, err);
    // });

    //Para conectarse a la BD con reintentos en caso de error
    this.attempts = 0;
    this.estadoConn = { code: "initial" };
    this.attemptConnection(this.estadoConn, this.attempts);
  }

  attemptConnection = async (estado, intentos) => {
    console.log("Status code ==> ", estado);
    console.log("Attempt num ==> ", intentos);
    
    //Si no se realizaron 5 intentos aún, se procede
    if (intentos < 5 ) {
      //Chequear!!
      switch (estado.code) {
        case 'ETIMEDOUT':
          console.log("TIMED OUT! Retrying");
          break;
        case 'ECONNREFUSED':
          console.log("REFUSED! Check");
          break;      
        default:
          console.log(estado);  
          break;
      }
    } else {
      console.log("Máximo de intentos alcanzado. Chequee la DB!");
      return;
      // process.exit(1);
    }

    //Si llega a este punto, se incrementa el ctdor de intentos
    this.attempts++;

    await this.checkConnection()
      .then((res) => {
        console.log("Conexión establecida");
        this.estadoConn = { ...res };
        this.attempts = 0;
      })
      .catch((err) => {
        console.log("Error - Reintentando");
        this.estadoConn = { ...err };
        setTimeout(() => this.attemptConnection(this.estadoConn, this.attempts), 5000);
      });
  };

  checkConnection = async () => {
    console.log("Chequeando...");
    try {
      return new Promise((resolve, reject) => {
        this.db.getConnection((error, connection) => {
          if (error) {            
            reject(error);
          }
          if (connection) {
            connection.release();
            resolve(connection);
          }
        });
      });
    } catch (err) {
      console.log("Code:", err.code, "Status:", err.status);
    }
  };

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
      // Convierte los errores de mysql a codigos de estado http
      console.log(Object.entries(err));
      const mysqlErrorList = Object.keys(HttpStatusCodes);      
      let status = mysqlErrorList.includes(err.code)
        ? HttpStatusCodes[err.code]
        : 500;
      
      throw new HttpException(status, 'Error interno de la BD', err);
    });
  };
}

// like ENUM
const HttpStatusCodes = Object.freeze({
  ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
  ER_BAD_NULL_ERROR: 422,
  ER_DUP_ENTRY: 409,
  ECONNREFUSED: 504,
  ETIMEDOUT: 504,
});

module.exports = new ConexionDB();
