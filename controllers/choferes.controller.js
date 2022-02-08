const conexion = require("../db/db-connection");
const HttpException = require("../lib/httpexception.utils");

class Chofer {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************

  listaChoferes = async (req, res, next) => {
    try {
      // --- Sentencia para probar manejo de errores: tabla vacía
      // let sql = 'SELECT * FROM comprobantes';

      // --- Sentencia correcta ---
      let sql = `SELECT p.persona_id, p.apellido, p.nombre,
                        c.chofer_id, c.habilitado
                   FROM personas p JOIN choferes c
                     ON p.persona_id = c.persona_id
                  ORDER BY p.apellido`;

      const lista = await conexion.query(sql);
      if (!lista.length) {
        throw new HttpException(404, "No hay Choferes cargados");
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };

  detalleChofer = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro

      // La query con DATE_FORMAT devuelve el formato aceptado por el input "date"
      // Reemplazada por la query sin DATE_FORMAT por el uso del "ng-pick-datetime"

      // let sql = `SELECT p.persona_id, p.apellido, p.nombre, p.direccion,
      //                   p.telefono, p.email, DATE_FORMAT(p.fecha_nac, '%Y-%m-%d') AS fecha_nac,
      //                   c.chofer_id, c.carnet_nro, c.habilitado,
      //                   DATE_FORMAT(c.carnet_vence, '%Y-%m-%d') AS carnet_vence
      //             FROM personas p JOIN choferes c
      //               ON p.persona_id = c.persona_id
      //            WHERE c.chofer_id = ?`;
      let sql = `SELECT p.persona_id, p.apellido, p.nombre, 
                        p.direccion, p.telefono, p.email, p.fecha_nac,
                        c.chofer_id, c.carnet_nro, c.habilitado, c.carnet_vence 
                  FROM personas p JOIN choferes c
                    ON p.persona_id = c.persona_id
                 WHERE c.chofer_id = ?`;
      const results = await conexion.query(sql, [id]);

      if (!results.length) {
        throw new HttpException(404, "Chofer inexistente");
      }
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  nuevoChoferFull = async (req, res, next) => {
    try {
      let {
        apellido,
        nombre,
        direccion,
        telefono,
        email = null,
        fecha_nac = null,
        carnet_nro,
        carnet_vence,
        habilitado,
      } = req.body; //Recupera los campos enviados desde el form

      //Si se recibe una fecha, se convierte a formato Fecha válido
      if (fecha_nac) {
        fecha_nac = new Date(fecha_nac);
      }
      carnet_vence = new Date(carnet_vence);

      //Llama el stored procedure que inserta la persona y el chofer al mismo tiempo
      let sql = "CALL nuevo_chofer_full(?,?,?,?,?,?,?,?,?)";
      const results = await conexion.query(sql, [
        apellido,
        nombre,
        direccion,
        telefono,
        email,
        fecha_nac,
        carnet_nro,
        carnet_vence,
        habilitado,
      ]);
      console.log("CALL =>", results);
      
      const [created] = [results[0][0]];      
      res.status(201).json({ success: true, action: "added", created });
    } catch (error) {
      next(error);
    }
  };

  nuevoChoferDesdeAdh = async (req, res, next) => {
    try {
      let { persona_id, carnet_nro, carnet_vence, habilitado } = req.body; //Recupera los campos enviados desde el form
      let chofer = { carnet_nro, carnet_vence };
      console.log(chofer);

      //Convierte los valores recibidos a formato Fecha válido
      carnet_vence = new Date(carnet_vence);

      // Sentencia anterior, reemplazada por llamado a stored procedure
      // let sql = `INSERT INTO choferes
      //                   (persona_id, carnet_nro, carnet_vence, habilitado)
      //             VALUES(?,?,?,?)`;
      
      //Inserta sólo los datos extra del Chofer Nuevo, referenciando el id del Adherente ya cargado
      let sql = "CALL nuevo_chofer_desde_adherente(?,?,?,?)";
      const results = await conexion.query(sql, [
        persona_id,
        carnet_nro,
        carnet_vence,
        habilitado,
      ]);
      console.log("INSERT Chof desde Adh =>", results);
      
      const [created] = [results[0][0]];
      res.status(201).json({ success: true, action: "added", created });
    } catch (error) {
      next(error);
    }
  };

  updateChofer = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro
      let { carnet_nro, carnet_vence } = req.body; //Recupera los campos enviados desde el form

      //Convierte los valores recibidos a formato Fecha válido
      carnet_vence = new Date(carnet_vence);

      let sql = `UPDATE choferes SET 
                        carnet_nro=?, carnet_vence=?
                  WHERE chofer_id=?`;
      const results = await conexion.query(sql, [carnet_nro, carnet_vence, id]);

      if (results["changedRows"] < 1) {
        throw new HttpException(418, "No hubo cambios", {
          action: "unchanged",
          ...results,
        });
      }
      res.status(200).json({ success: true, action: "updated", results });
    } catch (err) {
      next(error);
    }
  };
}

module.exports = new Chofer();
