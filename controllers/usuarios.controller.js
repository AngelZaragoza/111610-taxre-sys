const express = require("express");
const bcrypt = require("bcrypt");
const conexion = require("../db/db-connection");

class Usuario {
  nombreTabla = "usuarios";

  //**********************************
  //* Métodos llamados por el router *
  //**********************************
  listaUsuarios = async (req, res) => {
    let sql = `SELECT p.apellido, p.nombre, p.fecha_nac, u.usuario_id, u.alias, r.nombre AS rol
      FROM personas p JOIN usuarios u
        ON p.persona_id = u.persona_id
      JOIN roles r
        ON u.rol_id = r.rol_id`;

    const lista = await conexion.query(sql);
    if (!lista.length) {
      res
        .status(404)
        .json({ success: false, message: "No se encontraron usuarios" });
    }
    res.status(200).json(lista);
  };

  nuevoUsuario = async (req, res) => {
    try {
      let {
        apellido,
        nombre,
        direccion,
        telef,
        correo = null,
        fechaNac = null,
        username,
        password,
        rol,
      } = req.body; //Recupera los campos enviados desde el form

      password = await this.passwordUtil(password);
      console.log(password);

      let user = { apellido, nombre, username };
      console.log(user);

      //Llama el stored procedure que inserta la persona y el usuario al mismo tiempo
      let sql = "CALL nuevo_usuario(?,?,?,?,?,?,?,?,?)";
      const results = await conexion.query(sql, [
        apellido,
        nombre,
        direccion,
        telef,
        correo,
        fechaNac,
        username,
        password,
        rol,
      ]).then;

      console.log(results);
      return res.status(201).json({ success: "true", action: "added", user });
    } catch (err) {
      console.log("Error en procedure", err);
      return res.status(500).json(err);
    }
  };

  loginUsuario = async (req, res) => {
    let { usuario, pass } = req.body;
    let user = {};

    if (usuario.length > 0) {
      user = await this.getUsuario("alias", usuario);
    } else {
      return res.status(400).json({ error: "Introduzca nombre de usuario" });
    }

    if (user) {
      console.log(user);
      // console.log("tamano", user.length);
      // console.log("pass", user.password);
      let autorizado = await this.passwordUtil(pass, user.password);
      if (autorizado) {
        let { password, ...userSinPass} = user;
        console.log(req.session);
        return res.status(200).json({ userSinPass, auth: autorizado });
        
      }      
    } else {
      console.log(user);
      res.status(404).json({ error: "No existe usuario" });
    }
  };

  loginSuccess = (req, res, next) => {
    // req.logout();
    console.log( 'Session:', req.session );
    console.log( 'Usuario:', req.user );
    console.log( 'Passport:', req.passport );
    res.status(200).json( req.session );
  }

  logoutUsuario = (req, res, next) => {
    req.logout();
    res.redirect('/');
  }

  //**********************************
  //* Métodos auxiliares internos *
  //**********************************

  getUsuario = async (field, value) => {
    let sql = `SELECT * FROM usuarios WHERE ${field} = ?`;
    const user = await conexion.query(sql, [value]);
    if (user.length > 0) {
      return user[0];
    } else {
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

  /*
  Método que probablemente sirva para recuperar por urlQuery
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
  */

  
}

module.exports = new Usuario();
