const conexion = require("../db/db-connection");
const HttpException = require("../lib/httpexception.utils");

class Movil {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************
  listaMoviles = async (req, res, next) => {
    try {
      // --- Sentencia para probar manejo de errores: tabla vacía
      // let sql = 'SELECT * FROM comprobantes';

      // --- Sentencia correcta ---
      let sql = `SELECT m.movil_id, m.nro_interno, m.nro_habilitacion, m.marca, m.modelo,
                          p.persona_id, CONCAT(p.apellido, ', ', p.nombre) AS adherente,
                          t.tipo_movil_id, t.nombre AS tipo
                     FROM tipos_movil t JOIN moviles m
                       ON t.tipo_movil_id = m.tipo_movil_id
                     JOIN adherentes a
                       ON m.adherente_id = a.adherente_id
                     JOIN personas p
                       ON a.persona_id = p.persona_id
                    ORDER BY m.nro_interno`;

      const lista = await conexion.query(sql);
      if (!lista.length) {
        throw new HttpException(404, "No hay Móviles cargados");
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };

  detalleMovil = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro

      // La query con DATE_FORMAT devuelve el formato aceptado por el input "date"
      // Reemplazada por la query sin DATE_FORMAT por el uso del "ng-pick-datetime"

      // let sql = `SELECT m.movil_id, m.adherente_id, m.tipo_movil_id, m.marca, m.modelo,
      //                   m.descripcion, m.dominio, m.nro_habilitacion,
      //                   m.nro_interno, m.anio_fabr, m.chofer_pref,
      //                   DATE_FORMAT(m.fecha_itv, '%Y-%m-%d') AS fecha_itv, m.seguro
      //             FROM moviles m
      //            WHERE m.movil_id = ?`;
      let sql = `SELECT m.movil_id, m.adherente_id, m.tipo_movil_id, m.marca, m.modelo,  
                        m.descripcion, m.dominio, m.nro_habilitacion, 
                        m.nro_interno, m.anio_fabr, m.chofer_pref, 
                        m.fecha_itv, m.seguro
                  FROM moviles m 
                 WHERE m.movil_id = ?`;
      const results = await conexion.query(sql, [id]);

      if (!results.length) {
        throw new HttpException(404, "Móvil inexistente");
      }
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  nuevoMovilFull = async (req, res, next) => {
    try {
      let {
        adherente_id,
        tipo_movil_id,
        marca,
        modelo,
        descripcion,
        dominio,
        nro_habilitacion,
        nro_interno,
        anio_fabr,
        chofer_pref = null,
        fecha_itv = null,
        seguro = null,
      } = req.body; //Recupera los campos enviados desde el form

      //Si se recibe una fecha, se convierte a formato Fecha válido
      if (fecha_itv) {
        fecha_itv = new Date(fecha_itv);
      }

      let sql = `CALL nuevo_movil(?,?,?,?,?,?,?,?,?,?,?,?)`;
      const results = await conexion.query(sql, [
        adherente_id,
        tipo_movil_id,
        marca,
        modelo,
        descripcion,
        dominio,
        nro_habilitacion,
        nro_interno,
        anio_fabr,
        chofer_pref,
        fecha_itv,
        seguro,
      ]);
      console.log("CALL =>", results);

      const [created] = [results[0][0]];
      res.status(201).json({ success: true, action: "added", resp: created });
    } catch (error) {
      next(error);
    }
  };

  updateMovil = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro
      let {
        adherente_id,
        tipo_movil_id,
        marca,
        modelo,
        descripcion,
        dominio,
        nro_habilitacion,
        nro_interno,
        anio_fabr,
        chofer_pref = null,
        fecha_itv = null,
        seguro = null,
      } = req.body; //Recupera los campos enviados desde el form

      //Si se recibe una fecha, se convierte a formato Fecha válido
      if (fecha_itv) {
        fecha_itv = new Date(fecha_itv);
      }

      let sql = `CALL update_movil(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      const results = await conexion.query(sql, [
        id,
        adherente_id,
        tipo_movil_id,
        marca,
        modelo,
        descripcion,
        dominio,
        nro_habilitacion,
        nro_interno,
        anio_fabr,
        chofer_pref,
        fecha_itv,
        seguro,
      ]);

      console.log("CALL =>", results);

      const [updated] = [results[0][0]];
      res.status(201).json({ success: true, action: "updated", resp: updated });
    } catch (error) {
      next(error);
    }
  };

  listaTipos = async (req, res, next) => {
    try {
      let sql = `SELECT t.tipo_movil_id, t.nombre
                     FROM tipos_movil t`;

      const lista = await conexion.query(sql);
      if (!lista.length) {
        throw new HttpException(404, "No hay Tipos cargados");
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new Movil();
