const conexion = require("../db/db-connection");

class Chofer {
  //**********************************
  //* Métodos llamados por el router *
  //**********************************

  listaChoferes = async (req, res) => {
    let sql = `SELECT p.persona_id,p.apellido, p.nombre,
                      c.chofer_id, c.habilitado
                 FROM personas p JOIN choferes c
                   ON p.persona_id = c.persona_id`;

    const lista = await conexion.query(sql);
    if (!lista.length) {
      res
        .status(404)
        .json({ success: false, message: "No se encontraron choferes" });
    } else {
      res.status(200).json(lista);
    }
  };

  detalleChofer = async (req, res) => {
    let { id } = req.params; //Recupera el id enviado por parámetro
    let sql = `SELECT p.persona_id, p.apellido, p.nombre, p.direccion,
                      p.telefono, p.email, DATE_FORMAT(p.fecha_nac, '%Y-%m-%d') AS fecha_nac,
                      a.adherente_id, a.moviles_activos, a.observaciones
                FROM personas p JOIN choferes c
                  ON p.persona_id = c.persona_id
               WHERE c.chofer_id = ?`;
    const results = await conexion.query(sql, [id]);

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json({ success: false, message: "No existe chofer" });
    }
  };

  nuevoChoferFull = async (req, res) => {
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

      let chofer = { apellido, nombre, habilitado };
      console.log(chofer);

      //Llama el stored procedure que inserta la persona y el adherente al mismo tiempo
      let sql = "CALL nuevo_chofer(?,?,?,?,?,?,?,?,?)";
      const results = await conexion
        .query(sql, [
          apellido,
          nombre,
          direccion,
          telefono,
          email,
          fecha_nac,
          carnet_nro,
          carnet_vence,
          habilitado,
        ])
        .then((resp) => {
          console.log("CALL =>", resp);
          return res
            .status(201)
            .json({ success: true, action: "added", chofer, resp });
        })
        .catch((err) => {
          console.log("Error en procedure", err);
          return res.status(500).json({ success: false, err });
        });
    } catch (err) {
      console.log("Error en procedure", err);
      return res.status(500).json({ success: false, err });
    }
  };

  nuevoChoferDesdeAdh = async (req, res) => {
    try {
      let { persona_id, carnet_nro, carnet_vence, habilitado } = req.body; //Recupera los campos enviados desde el form
      let chofer = { carnet_nro, carnet_vence };
      console.log(chofer);

      //Inserta sólo los datos extra del Chofer Nuevo, referenciando el id del Adherente ya cargado
      let sql = `INSERT INTO choferes (persona_id, carnet_nro, carnet_vence, habilitado)
                  VALUES(?,?,?,?)`;
      const result = await conexion
        .query(sql, [persona_id, carnet_nro, carnet_vence, habilitado])
        .then((resp) => {
          console.log("INSERT =>", resp);
          return res
            .status(201)
            .json({ success: true, action: "added", chofer, resp });
        })
        .catch((err) => {
          console.log("Error en insert", err);
          return res.status(500).json({ success: false, err });
        });
    } catch (err) {
      console.log("Error en insert", err);
      return res.status(500).json({ success: false, err });
    }
  };
}

module.exports = new Chofer();
