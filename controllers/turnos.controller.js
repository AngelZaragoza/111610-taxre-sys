const conexion = require('../db/db-connection');
const HttpException = require('../lib/httpexception.utils');

class Turno {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************

  getTurnoActivo = async (req, res, next) => {
    try {
      // --- Sentencia para probar manejo de errores: tabla vacía
      // let sql = 'SELECT * FROM comprobantes ORDER BY comprobante_id LIMIT 1';


      let sql = `SELECT t.turno_id, t.usuario_id, u.alias,
                        t.estado_pago_id, t.hora_inicio, 
                        t.hora_cierre, t.horas_extra, t.observaciones
                  FROM turnos_operadores t JOIN usuarios u
                    ON t.usuario_id = u.usuario_id
                 ORDER BY turno_id DESC LIMIT 1`;

      const result = await conexion.query(sql);

      // Si se encuentra un registro y la petición es de tipo GET,
      // se devuelve el resultado al cliente
      if (result.length && req.method === 'GET') {
        return res.status(200).json({
          success: true,
          message: 'Último turno cargado',
          turno: result[0],
        });
      }

      // Si se encuentra un registro y la petición NO ES de tipo GET,
      // se pasa el resultado y el control al siguiente middleware
      if (result.length && req.method !== 'GET') {
        req.turno = result[0];
        return next();
      }

      // Si NO hay resultados y la petición es de tipo GET,
      // se retorna el mensaje de error al cliente
      if (!result.length && req.method === 'GET') {
        return res
          .status(404)
          .json({ success: false, message: 'No hay turnos cargados' });
      }

      // Si NO hay resultados y la petición NO ES de tipo GET,
      // se pasa el control al siguiente middleware
      if (!result.length && req.method !== 'GET') {
        return next();
      }
    } catch (error) {
      next(error);
    }
  };

  //**********************************
  //* Listados *
  //**********************************

  estadoTurnosFechas = async (req, res, next) => {
    try {
      let { hora_inicio = '2015-01-01 00:00', hora_cierre = '2035-12-31 23:59' } =
        req.query; // Recupera los datos desde la query, o asigna valores por default

      // Convertir los queryparams a objetos fecha válidos
      hora_inicio = new Date(hora_inicio);
      hora_cierre = new Date(hora_cierre);

      // Si el cliente no envía el formato de fecha válido, se arroja una excepción
      if (hora_inicio.toString() === 'Invalid Date' || hora_cierre.toString() === 'Invalid Date') {
        throw new HttpException(422, 'Formato de fecha no válido')
      }

      // Recupera los datos del usuario logueado actualmente
      let { usuario_id, rol_id } = req.user;

      // Contendrá el arreglo de argumentos para la query
      let argumentos = [hora_inicio, hora_cierre];

      // Si el usuario no es Admin o Encargado, se agrega filtro a la query
      let notAdmin = '';
      if (rol_id > 2) {
        argumentos.push(usuario_id);
        notAdmin = ' AND t.usuario_id=?';
      }

      let fechaDesde = 't.hora_inicio >= CAST(? AS DATETIME)';
      let fechaHasta = 't.hora_cierre <= CAST(? AS DATETIME)';

      let sql = `SELECT t.turno_id, t.usuario_id, u.alias,
                        t.estado_pago_id, ep.estado,
                        t.hora_inicio, t.hora_cierre, 
                        t.horas_extra, t.observaciones 
                   FROM turnos_operadores t JOIN usuarios u
                     ON t.usuario_id = u.usuario_id
                   JOIN estado_pago ep
                     ON t.estado_pago_id = ep.estado_pago_id
                  WHERE (${fechaDesde} AND ${fechaHasta}) ${notAdmin} 
                  ORDER BY t.hora_inicio ASC`;

      const lista = await conexion.query(sql, argumentos);
      
      if (!lista.length) {
        throw new HttpException(404, 'No se encontraron turnos');
      } 
      
      res.status(200).json(lista);      
    } catch (error) {
      next(error);
    }
  };

  ultimosNTurnos = async (req, res, next) => {
    try {
      //Cantidad de registros a recuperar por query
      //Default: 5
      let { cant = '5' } = req.query;

      // --- Sentencia para probar manejo de errores: tabla vacía
      // let sql = 'SELECT * FROM comprobantes where comprobante_id=?';

      // --- Sentencia correcta      
      let sql = `SELECT t.turno_id, t.usuario_id, u.alias,
                          t.hora_inicio, t.hora_cierre, 
                          t.observaciones 
                     FROM turnos_operadores t JOIN usuarios u
                       ON t.usuario_id = u.usuario_id
                    ORDER BY t.turno_id DESC LIMIT ?`;
      const lista = await conexion.query(sql, [cant]);
      if (!lista.length) {
        throw new HttpException(404, 'No se encontraron turnos');
      }
      res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  };  

  //**********************************
  //* Operaciones con los Turnos *
  //**********************************

  inicioTurno = async (req, res, next) => {
    try {
      let {
        usuario_id,
        estado_pago_id = 1,
        hora_inicio,
        horas_extra = 0,
        observaciones = null,
      } = req.body; //Recupera los campos del form
      let valido = false;

      // Convierte 'hora_inicio' a un objeto Date válido
      let abre = new Date(hora_inicio);
      hora_inicio = abre;

      // Si el turno anterior existe y NO tiene 'hora_cierre' se arroja una excepción
      let anterior = req.turno;
      if (anterior && !anterior.hora_cierre) {
        throw new HttpException(409, 'El turno anterior no fue cerrado');
      }

      // Si el turno anterior existe y tiene 'hora_cierre',
      // verifica que 'hora_inicio' sea mayor a 'hora_cierre'
      if (anterior) {
        valido = hora_inicio >= anterior.hora_cierre;
      } else {
        // Si el turno anterior no existe, es el primero en crearse
        valido = true;
      }

      if (!valido) {
        throw new HttpException(409, 'La hora de inicio es inválida', {
          anterior: anterior.hora_cierre,
        });
      }

      let sql = `INSERT INTO turnos_operadores
                             (usuario_id, estado_pago_id,
                             hora_inicio, horas_extra, observaciones)
                      VALUES (?,?,?,?,?)`;
      const result = await conexion.query(sql, [
        usuario_id,
        estado_pago_id,
        hora_inicio,
        horas_extra,
        observaciones,
      ]);

      const started = {
        usuario_id,
        turno_id: result.insertId,
        hora_inicio
      };
      
      return res.status(201).json({ success: true, action: 'started', turno: started });
    } catch (error) {
      next(error);      
    }
  };

  cierreTurno = async (req, res, next) => {
    try {
      let { hora_cierre, horas_extra = 0, observaciones = null } = req.body;

      // Si no se encuentra un turno abierto se arroja una excepción
      let abierto = req.turno;
      if (!abierto || abierto.hora_cierre !== null) {
        throw new HttpException(409, 'No se encontró un turno abierto');
      }

      // Se verifica que 'hora_cierre' sea mayor
      // que 'hora_inicio' del turno abierto
      hora_cierre = new Date(hora_cierre);
      let valido = hora_cierre > abierto.hora_inicio;
      if (!valido) {
        throw new HttpException(409, 'La hora de cierre es inválida');
      }

      let sql = `UPDATE turnos_operadores 
                  SET hora_cierre=?, 
                      horas_extra=?, 
                      observaciones=? 
                WHERE turno_id=?`;
      const result = await conexion.query(sql, [
        hora_cierre,
        horas_extra,
        observaciones,
        abierto.turno_id,
      ]);

      if (result.changedRows > 0) {
        const finished = {
          usuario_id: abierto.usuario_id,
          turno_id: abierto.turno_id,
          hora_inicio: abierto.hora_inicio,
          hora_cierre,
        };
        return res
          .status(200)
          .json({ success: true, action: 'finished', turno: finished });
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
}

module.exports = new Turno();
