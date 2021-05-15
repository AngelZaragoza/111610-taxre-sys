const express = require("express");
const bcrypt = require("bcrypt");
const conexion = require("../db/db-connection");
// const usuarios = "usuarios";
// const personas = "personas";

class Usuario {
  nuevoUsuario = async (req, res) => {
    let {
      apellido,
      nombre,
      direccion,
      telef,
      correo = null,
      fechaNac = null,
      usuario,
      pass,
      rol,
    } = req.body;

    let hashed = await bcrypt.hash(pass, 10);

    //Llama el stored procedure que inserta la persona y el usuario al mismo tiempo
    let sql = "CALL nuevo_usuario(?,?,?,?,?,?,?,?,?)";
    conexion.db.query(
      sql,
      [
        apellido,
        nombre,
        direccion,
        telef,
        correo,
        fechaNac,
        usuario,
        hashed,
        rol,
      ],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(400).json(error);
        }
        //Loguear resultados no es muy informativo ya que se llama
        //un stored procedure que no devuelve la cantidad de filas afectadas p.ej.
        // console.log(results);
        return res
          .status(201)
          .json({ success: true, action: "added", user: usuario });
      }
    );
  };

  loginUsuario = async (req, res) => {
    let { usuario, correo, pass } = req.body;

    if (usuario) {
      // const found = await this.getUsuarioAlias(usuario).then((found) => {
      //   if (found.success) {
      //     let autorizado = await bcrypt.compare(pass, found.user.password);
      //     res.status(200).json({user: found.user.alias, auth: autorizado});
      //   } else {
      //     res.status(404).json({user: found.message, auth: autorizado});
      //   }
      // })

      let found = await this.getUsuarioAlias(usuario);
      if (found.success) {
        let autorizado = await bcrypt.compare(pass, found.user.password);
        res.status(200).json({ user: found.user.alias, auth: autorizado });
      } else {
        res.status(404).json({ user: found.message, auth: autorizado });
      }
    }
  };

  getUsuarioAlias = async (alias) => {
    let sql = `SELECT * FROM usuarios WHERE alias = ?`;
    conexion.db.query(sql, [alias], (error, results) => {
      if (error) {
        console.log(error);
        return null;
      }
      console.log(results);
      if (results.length > 0) {
        return { success: true, user: results };
      } else {
        return { success: false, message: "No existe usuario" };
      }
    });
  };

  getUsuarioByAlias = async (req, res) => {
    let { usuario } = req.query;
    let sql = `SELECT * FROM usuarios WHERE alias = ?`;
    conexion.db.query(sql, [usuario], (error, results) => {
      if (error) {
        console.log(error);
        return res.status(400).json(error);
      }
      console.log(results);
      if (results.length > 0) {
        return res.status(200).json({ success: true, user: results });
      } else {
        return res
          .status(200)
          .json({ success: false, message: "No existe usuario" });
      }
    });
  };

  listaUsuarios = (req, res) => {
    let sql = `SELECT p.apellido, p.nombre, p.fecha_nac, u.alias, r.nombre AS rol
      FROM personas p JOIN usuarios u
        ON p.persona_id = u.persona_id
      JOIN roles r
        ON u.rol_id = r.rol_id`;
    conexion.db.query(sql, (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json(results);
      }
    });
  };
}

module.exports = new Usuario();
