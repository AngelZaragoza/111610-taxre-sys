const conexion = require('../db/db-connection');
const HttpException = require('../lib/httpexception.utils');

class Jornada {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************
  jornadasMovilesRangoFechas = async (req, res, next) => {
    try {
      let {
        movil_id,
        chofer_id,
        hora_inicio = '2015-01-01',
        hora_cierre = '2035-12-31',
      } = req.query; //Recupera los datos desde la query, o asigna valores por default

      let { usuario_id, rol_id } = req.user; //Recupera los datos del usuario logueado actualmente

      // if (Date(hora_inicio) > Date(hora_cierre)) {
      //   throw new HttpException(
      //     409,
      //     'La fecha Inicial no puede ser mayor a la fecha Final'
      //   );
      // }
      if (!this.validaFechas(hora_inicio, hora_cierre)) {
        throw new HttpException(
          409,
          'La fecha Inicial no puede ser mayor a la fecha Final'
        );
      }

      let fechaDesde = 'j.hora_inicio >= CAST(? AS DATETIME)';
      let fechaHasta = 'j.hora_cierre <= CAST(? AS DATETIME)';

      let sql = `SELECT j.jornada_id, j.movil_id, j.chofer_id, 
                        u.usuario_id, u.alias,
                        j.hora_inicio, j.hora_cierre 
                   FROM jornadas_moviles j 
                   JOIN turnos_operadores t 
                     ON j.turno_inicio = t.turno_id
                   JOIN usuarios u 
                     ON u.usuario_id = t.usuario_id 
                WHERE ${fechaDesde} AND ${fechaHasta}`;
      const lista = await conexion.query(sql, [hora_inicio, hora_cierre]);
      if (!lista.length) {
        throw new HttpException(404, 'No se encontraron Jornadas');
      } else {
        res.status(200).json(lista);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Recupera todos los Móviles registrados y sus últimas Jornadas creadas
   */
  jornadasActivas = async (req, res, next) => {
    try {
      // *** CONSULTA CORRECTA: Devuelve siempre las últimas Jornadas creadas ***
      // Con LEFT JOIN trae todos los móviles aunque no tengan una Jornada creada aún.
      let sql = `SELECT m.movil_id, m.nro_interno, m.nro_habilitacion, m.chofer_pref, 
                        t.nombre AS tipo, CONCAT(m.marca, ' ', m.modelo) AS modelo,
                        j.jornada_id, j.chofer_id, j.turno_inicio, 
                        j.hora_inicio, j.turno_cierre, j.hora_cierre 
                   FROM tipos_movil t INNER JOIN moviles m
                     ON t.tipo_movil_id = m.tipo_movil_id
                   LEFT JOIN jornadas_moviles j
                     ON j.movil_id = m.movil_id
                    AND j.jornada_id IN 
                        (SELECT MAX(jm.jornada_id) 
                           FROM jornadas_moviles jm 
                          GROUP BY jm.movil_id)
                  GROUP BY m.movil_id
                  ORDER BY m.nro_interno ASC`;

      const lista = await conexion.query(sql);
      if (!lista.length) {
        throw new HttpException(404, 'No hay Móviles cargados');
      } else {
        res.status(200).json(lista);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Recupera la última Jornada de un Móvil y la pasa a la siguiente función
   */
  chequearJornada = async (req, res, next) => {
    try {
      let { movil_id } = req.body;
      let sql = `SELECT j.jornada_id, j.movil_id, j.chofer_id,
                        j.turno_inicio, j.hora_inicio, 
                        j.turno_cierre, j.hora_cierre 
                   FROM jornadas_moviles j
                  WHERE j.movil_id = ?
                  ORDER BY j.jornada_id DESC LIMIT 1`;
      const result = await conexion.query(sql, [movil_id]);
      if (!result.length && req.method === 'PATCH') {
        throw new HttpException(409, 'El Móvil no tiene una Jornada abierta');
      }
      req.jornada = result;
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Recupera detalles de la Jornada especificada
   */
  detalleJornada = async (req, res, next) => {
    try {
      let { id } = req.params; // Recupera el id enviado por parámetro
      let sql = `SELECT j.jornada_id, j.movil_id, j.chofer_id,
                        j.turno_inicio, j.hora_inicio, 
                        j.turno_cierre, j.hora_cierre 
                   FROM jornadas_moviles j
                  WHERE j.jornada_id = ?`;
      const results = await conexion.query(sql, [id]);

      if (!results.length) {
        throw new HttpException(404, 'Jornada inexistente');
      }
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Registra el Turno y la Hora de Inicio de Jornada de un Móvil
   */
  inicioJornada = async (req, res, next) => {
    try {
      let { movil_id, chofer_id, turno_inicio, hora_inicio } = req.body;

      // Si el Móvil posee Jornadas iniciadas, se recupera el cierre anterior
      let cierre_anterior = req.jornada.length ? req.jornada[0].hora_cierre : hora_inicio;
      // Se verifica la validez de las fechas proporcionadas
      let { error, fecha: inicio } = this.validaFechas(cierre_anterior, hora_inicio, true);
      
      if (error) {          
        throw new HttpException(422, `Jornada: ${error}`);
      }
      
      const sql = `INSERT INTO jornadas_moviles
                                (movil_id, chofer_id, 
                                turno_inicio, hora_inicio)
                        VALUES (?,?,?,?)`;

      const result = await conexion.query(sql, [
        movil_id,
        chofer_id,
        turno_inicio,
        inicio,
      ]);

      const started = {
        movil_id,
        jornada_id: result.insertId,
        turno_inicio,
        inicio,
      };

      return res.status(201).json({ success: true, action: 'started', jornada: started });
    } catch (error) {
      next(error);
    }
  };

  cierreJornada = async (req, res) => {
    try {
      let { jornada_id, turno_cierre, hora_cierre } = req.body;
      // Si el Móvil posee Jornadas iniciadas, se recupera el inicio anterior
      let { jornada_id: jornada_abierta, hora_inicio } = req.jornada[0];
      
      if (jornada_abierta !== jornada_id) {
        let mensaje = `Jornada: El id proporcionado no corresponde al Móvil`;
        throw new HttpException(422, mensaje);
      }
      // Se verifica la validez de las fechas proporcionadas
      let { error, fecha: cierre } = this.validaFechas(hora_inicio, hora_cierre);
      
      if (error) {          
        throw new HttpException(422, `Jornada: ${error}`);
      }

      const sql = `UPDATE jornadas_moviles 
                      SET turno_cierre=?, hora_cierre=?
                    WHERE jornada_id=?`;

      const result = await conexion.query(sql, [turno_cierre, cierre, jornada_id]);
      if (result.changedRows > 0) {
        const finished = {
          jornada_id,
          turno_cierre,
          hora_cierre: cierre,
        };
        return res
          .status(200)
          .json({ success: true, action: 'finished', jornada: finished });
      } else {
        throw new HttpException(418, 'No hubo cambios', {
          action: 'unchanged',
          ...result,
        });
      }      
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verifica el formato de las fechas provistas y que  
   * la fecha "actual" no sea anterior a la fecha "previa"
   * @param {string | Date} previa Fecha previa o mínima
   * @param {string | Date} actual Fecha actual o próxima
   * @param {boolean} inicio true: Inicio de Turno o Jornada
   * @returns Object: { error: string | null, fecha: Date | null }
   */
  validaFechas = (previa, actual, inicio) => {
    let pre = previa !== null ? new Date(previa) : false;
    let act = actual !== null ? new Date(actual) : false;
    
    // Si se intenta Inicio y no se hay un Cierre anterior
    if (inicio && !pre) {
      return { error: 'No se ha registrado el Cierre anterior', fecha: null};
    }

    // Si se provee datos no válidos
    if (pre.toString() === 'Invalid Date' || act.toString() === 'Invalid Date') {
      return { error: 'Formato de Fecha/Hora inválido', fecha: null };
    }
    
    let error = null;
    const operacion = inicio ? 'inicio' : 'cierre';
    if (pre && act) {
      error = pre <= act
        ? null
        : `Fecha/Hora de ${operacion} inválida (menor a una anterior)`;
    } else {
      error = `Falta un argumento (Fecha/Hora de ${operacion})`;
      act = null;
    }
      
    return { error, fecha: act};
  };
}

module.exports = new Jornada();
