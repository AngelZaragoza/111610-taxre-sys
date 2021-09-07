const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const conexion = require("../db/db-connection");
const HttpException = require("../lib/httpexception.utils");

class Usuario {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************
  listaRoles = async (req, res, next) => {
    try {
      let sql = "SELECT * FROM roles";
      const lista = await conexion.query(sql);

      if (!lista.length) {
        throw new HttpException(404, "No se encontraron roles");
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };

  listaUsuarios = async (req, res, next) => {
    try {
      // --- Sentencia para probar manejo de errores: tabla vacía
      // let sql = 'SELECT * FROM comprobantes';

      // --- Sentencia correcta ---
      let sql = `SELECT p.apellido, p.nombre, p.fecha_nac, u.usuario_id, u.alias, r.nombre AS rol
        FROM personas p JOIN usuarios u
          ON p.persona_id = u.persona_id
        JOIN roles r
          ON u.rol_id = r.rol_id`;

      const lista = await conexion.query(sql);

      if (!lista.length) {
        throw new HttpException(404, "No hay Usuarios cargados");
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };

  detalleUsuario = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro

      // La query con DATE_FORMAT devuelve el formato aceptado por el input "date"
      // Reemplazada por la query sin DATE_FORMAT por el uso del "ng-pick-datetime"

      // let sql = `SELECT p.persona_id, p.apellido, p.nombre, p.direccion,
      //                   p.telefono, p.email, DATE_FORMAT(p.fecha_nac, '%Y-%m-%d') AS fecha_nac,
      //                   u.usuario_id, u.rol_id, u.alias, u.password
      //             FROM personas p JOIN usuarios u
      //               ON p.persona_id = u.persona_id
      //            WHERE u.usuario_id = ?`;
      let sql = `SELECT p.persona_id, p.apellido, p.nombre, p.direccion,
                        p.telefono, p.email, p.fecha_nac,
                        u.usuario_id, u.rol_id, u.alias, u.password
                  FROM personas p JOIN usuarios u
                    ON p.persona_id = u.persona_id
                 WHERE u.usuario_id = ?`;

      const results = await conexion.query(sql, [id]);

      if (!results.length) {
        throw new HttpException(404, "Usuario inexistente");
      }
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  nuevoUsuarioFull = async (req, res, next) => {
    try {
      let {
        apellido,
        nombre,
        direccion,
        telefono,
        email = null,
        fecha_nac = null,
        alias,
        password,
        rol_id,
      } = req.body; //Recupera los campos enviados desde el form

      //Si se recibe una fecha, se convierte a formato Fecha válido
      if (fecha_nac) {
        fecha_nac = new Date(fecha_nac);
      }

      password = await this.passwordUtil(password);

      //Llama el stored procedure que inserta la persona y el usuario al mismo tiempo
      let sql = "CALL nuevo_usuario(?,?,?,?,?,?,?,?,?)";
      const results = await conexion.query(sql, [
        apellido,
        nombre,
        direccion,
        telefono,
        email,
        fecha_nac,
        alias,
        password,
        rol_id,
      ]);
      console.log("CALL =>", results);

      let user = { apellido, nombre, alias, usuario_id: results[0][0]["usuario_id"] };
      return res.status(201).json({ success: true, action: "added", user });
    } catch (error) {
      next(error);
    }
  };

  updateUsuario = async (req, res, next) => {
    try {
      let { id } = req.params;
      let { rol_id, alias, passwordAnterior, passwordConfirm } = req.body; //Recupera los campos enviados desde el form

      // Si no se encuentra el Usuario, se corta la ejecución
      let user = await this.getUsuario("usuario_id", id);
      if (!user) {
        throw new HttpException(404, "Usuario inexistente");
      }

      // Compara el password ingresado por el Usuario, si no es correcto se corta la ejecución
      let passCorrecto = await this.passwordUtil(passwordAnterior, user.password);
      if (!passCorrecto) {
        throw new HttpException(403, "El password anterior no es correcto");
      }

      //Si el password anterior es correcto, se hashea el nuevo password
      const password = await this.passwordUtil(passwordConfirm);

      let sql = `UPDATE usuarios SET 
                        rol_id=?, alias=?, password=?
                  WHERE usuario_id=?`;

      const results = await conexion.query(sql, [rol_id, alias, password, id]);
      console.log("UPDATE =>", results);
      if (results["changedRows"] < 1) {
        throw new HttpException(418, "No hubo cambios", {
          action: "unchanged",
          ...results,
        });
      }
      res.status(200).json({ success: true, action: "updated", results });
    } catch (error) {
      next(error);
    }
  };

  //**********************************
  //* Métodos llamados por passport *
  //**********************************

  loginSuccess = (req, res) => {
    let { password, ...userSinPass } = req.user;
    console.log("Passport authenticate: Logged In --", req.session.id);
    res.status(200).json({ logged: true, ...userSinPass });
  };

  loginFailed = (req, res) => {
    console.log("Passport authenticate: Failure --", req.session);
    res.status(401).json({ success: false, message: "Usuario o Password incorrectos" });
  };

  logoutUsuario = (req, res, next) => {
    try {
      req.logout();
      console.log("Passport authenticate: Logged Out --", req.session);
      res.status(200).json({ logged: false, message: "Sesión Cerrada", status: 200 });
    } catch (error) {
      error.status = 418;
      error.message = "Cerrar Sesión falló. Verifique";
      next(error);
    }
  };

  //**********************************
  //* Métodos auxiliares internos *
  //**********************************

  getUsuario = async (field, value) => {
    try {
      let sql = "";

      if (process.env.DB_VERSION != 8) {
        // Se trata los strings como case insensitive (MySQL versiones anteriores a la 8)
        sql = `SELECT * FROM usuarios WHERE ${field} = ?`;
      } else {
        // Si el campo a buscar es "alias", se convierte la comparación a case sensitive,
        // caso contrario 'Admin' sería igual de válido que 'admin' o 'ADmiN'
        // (Funciona en MySQL versiones 8+)
        sql =
          field == "alias"
            ? `SELECT * FROM usuarios WHERE ${field} = CONVERT(? USING utf8mb4) COLLATE utf8mb4_0900_as_cs`
            : `SELECT * FROM usuarios WHERE ${field} = ?`;
      }

      const user = await conexion.query(sql, [value]);
      if (user.length > 0) {
        return user[0];
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  passwordUtil = async (password, hash) => {
    if (!hash) {
      //Si no se proporciona hash, se calcula y devuelve hash
      return await bcrypt.hash(password, 10);
    } else {
      //Si se proporciona hash, se compara y devuelve true o false
      let authorized = await bcrypt.compare(password, hash);
      return authorized;
    }
  };
}

module.exports = new Usuario();
