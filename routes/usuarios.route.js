const express = require("express");
const router = express.Router();
const passport = require("passport");

const usuariosController = require("../controllers/usuarios.controller");
const personasController = require("../controllers/personas.controller");

function checkAuth(req, res, next) {
  console.log("Desde la prueba de auth:");
  let logged = req.isAuthenticated();
  if (logged) {
    res.redirect("login-success");
  } else {
    console.log("Debe Loguear... next");
    // res.status(200).json({ status: "logged out" });
    next();
  }
}

//Rutas con passport implementado
router.route("/").get(usuariosController.listaUsuarios);
router
  .route("/detalle/:id")
  .get(usuariosController.detalleUsuario)
  .put(personasController.updatePersona);
router.route("/roles").get(usuariosController.listaRoles);

router.route("/nuevo").post(usuariosController.nuevoUsuarioFull);

router.route("/login").get(checkAuth);

router.route("/passportLogin").post(
  checkAuth,
  passport.authenticate("local", {
    failureRedirect: "login-failed",
  }),
  function (req, res) {
    let { password, ...userSinPass } = req.user;
    console.log("Desde Passport authenticate:");

    console.log(req.session.id, userSinPass, req.session.cookie);
    res.status(200).json({ logged: true, ...userSinPass });
  }
);

router.route("/login-success").get(usuariosController.loginSuccess);
router.route("/login-failed").get(usuariosController.loginFailed);
router.route("/passportLogout").get(usuariosController.logoutUsuario);

// router.route('/q/').get(usuariosController.getUsuarioByAlias);
// router.route('/q/').get(usuariosController.getUsuarioAlias);


module.exports = router;
