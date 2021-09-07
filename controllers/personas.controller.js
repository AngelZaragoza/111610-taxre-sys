const conexion = require("../db/db-connection");
const HttpException = require("../lib/httpexception.utils");

class Persona {
  updatePersona = async (req, res, next) => {
    try {
      let { id } = req.params; //Recupera el id enviado por parámetro
      let {
        apellido,
        nombre,
        direccion,
        telefono,
        email = null,
        fecha_nac = null,
      } = req.body; //Recupera los campos enviados desde el form

      //Si se recibe una fecha, se convierte a formato Fecha válido
      if (fecha_nac) {
        fecha_nac = new Date(fecha_nac);
      }

      let sql = `UPDATE personas SET 
                        apellido=?, nombre=?, direccion=?, 
                        telefono=?, email=?, fecha_nac=?
                  WHERE persona_id=?`;
      const results = await conexion.query(sql, [
        apellido,
        nombre,
        direccion,
        telefono,
        email,
        fecha_nac,
        id,
      ]);

      console.log("UPDATE =>", results);
      if (results["changedRows"] < 1) {
        throw new HttpException(418, "No hubo cambios", { action: "unchanged", ...results });
      }
      res.status(200).json({ success: true, action: "updated", results });
      // .then((resp) => {
      //   console.log("UPDATE =>", resp);
      //   return res
      //     .status(200)
      //     .json({ success: "true", action: "updated", resp });
      // })
      // .catch((err) => {
      //   console.log("Error en update", err);
      //   return res.status(500).json(err);
      // });
    } catch (error) {
      next(error)
      // console.log(err);
      // return res.status(500).json(err);
    }
  };
}

module.exports = new Persona();
