const conexion = require("../db/db-connection");
const HttpException = require("../lib/httpexception.utils");

class Adherente {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************
  listaAdherentes = async (req, res, next) => {
    try {
      // --- Sentencia para probar manejo de errores: tabla vacía
      // let sql = 'SELECT * FROM comprobantes';

      // --- Sentencia correcta ---
      let sql = `SELECT p.persona_id,p.apellido, p.nombre,
                        a.adherente_id, a.moviles_activos
                   FROM personas p JOIN adherentes a
                     ON p.persona_id = a.persona_id
                  ORDER BY p.apellido`;

      const lista = await conexion.query(sql);
      if (!lista.length) {
        throw new HttpException(404, "No hay Adherentes cargados");
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };

  detalleAdherente = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro

      // La query con DATE_FORMAT devuelve el formato aceptado por el input "date"
      // Reemplazada por la query sin DATE_FORMAT por el uso del "ng-pick-datetime"

      // let sql = `SELECT p.persona_id, p.apellido, p.nombre, p.direccion,
      //                   p.telefono, p.email, DATE_FORMAT(p.fecha_nac, '%Y-%m-%d') AS fecha_nac,
      //                   a.adherente_id, a.moviles_activos, a.observaciones
      //             FROM personas p JOIN adherentes a
      //               ON p.persona_id = a.persona_id
      //            WHERE a.adherente_id = ?`;
      let sql = `SELECT p.persona_id, p.apellido, p.nombre, p.direccion,
                        p.telefono, p.email, p.fecha_nac, 
                        a.adherente_id, a.moviles_activos, a.observaciones
                  FROM personas p JOIN adherentes a
                    ON p.persona_id = a.persona_id
                 WHERE a.adherente_id = ?`;

      const results = await conexion.query(sql, [id]);

      if (!results.length) {
        throw new HttpException(404, "Adherente inexistente");
      }
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  nuevoAdherenteFull = async (req, res, next) => {
    try {
      let {
        apellido,
        nombre,
        direccion,
        telefono,
        email = null,
        fecha_nac = null,
        moviles_activos,
        observaciones = null,
      } = req.body; //Recupera los campos enviados desde el form

      //Si se recibe una fecha, se convierte a formato Fecha válido
      if (fecha_nac) {
        fecha_nac = new Date(fecha_nac);
      }

      //Llama el stored procedure que inserta la persona y el adherente al mismo tiempo
      let sql = "CALL nuevo_adherente(?,?,?,?,?,?,?,?)";
      const results = await conexion.query(sql, [
        apellido,
        nombre,
        direccion,
        telefono,
        email,
        fecha_nac,
        moviles_activos,
        observaciones,
      ]);
      console.log("CALL =>", results);

      const created = {
        apellido,
        nombre,
        moviles_activos,
        adherente_id: results[0][0]["adherente_id"],
        persona_id: results[0][0]["persona_id"],
      };
      res.status(201).json({ success: true, action: "added", created });
    } catch (error) {
      next(error);
    }
  };

  updateAdherente = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro
      let { observaciones = null } = req.body; //Recupera los campos enviados desde el form

      let sql = `UPDATE adherentes SET 
                        observaciones=?
                  WHERE adherente_id=?`;
      const results = await conexion.query(sql, [observaciones, id]);

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
}

module.exports = new Adherente();
