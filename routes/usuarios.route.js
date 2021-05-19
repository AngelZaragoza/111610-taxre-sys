const express = require("express");
const router = express.Router();
const passport = require("passport");
const { logoutUsuario } = require("../controllers/usuarios.controller");
const usuariosController = require("../controllers/usuarios.controller");

router.route("/nuevo").post(usuariosController.nuevoUsuario);
router.route("/").get(usuariosController.listaUsuarios);

router.route("/passportLogin").post(
  passport.authenticate("local", {
    failureRedirect: "/",
  }),
  function (req, res) {
    res.status(200).json( req.session );
  }
);
// router.route('/passportLogin').post(passport.authenticate('local', { failureRedirect: '/', successRedirect: 'login-success' }));
router.route("/login-success").get(usuariosController.loginSuccess);
router.route("/passportLogout").get(logoutUsuario);

// router.route('/login').post(usuariosController.loginUsuario);
// router.route('/q/').get(usuariosController.getUsuarioByAlias);
// router.route('/q/').get(usuariosController.getUsuarioAlias);

// router.post('/usuarios/nuevo', usuariosController.nuevoUsuario)
//Rutas con passport implementado

module.exports = router;
