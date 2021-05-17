const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
// const conexion = require("../db/db-connection");
const cors = require("cors");
const usuarios = require("../routes/usuarios.route");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

//*****************************************
//Configuración de varios middleware
//*****************************************

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//*****************************************
//Configuración del middleware de sesiones
//*****************************************
const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  createDatabaseTable: true,
  endConnectionOnClose: false,
};

const sessionStore = new MySQLStore(options);

app.use(
  session({
    // key: 'session_cookie_name',
    secret: process.env.SECRET_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8 //8hrs de duración máxima de la cookie
    }
  })
);

//*****************************************
//Configuración del puerto del servidor
//*****************************************

const port = Number(process.env.PORT || 3400);

//*****************************************
//Configuración de las rutas del servidor
//*****************************************

app.use("/usuarios", usuarios);
app.get('/', (req, res, next) => {
  res.status(200).json(req.session);
})
//*****************************************
//Levanta el servidor e informa el puerto
//*****************************************

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

//*****************************************
//Manejo "elegante" de cierre del servidor
//*****************************************

process.on("SIGTERM", () => {
  shutDown("SIGTERM");
});

process.on("SIGINT", () => {
  shutDown("SIGINT");
});

function shutDown(signal) {
  console.log(`${signal} recibido: cerrando server`);
  server.close(() => {
    console.log("Servidor cerrado con éxito");
    process.exit(0);
  });
}
