const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.route('/nuevo').post(usuariosController.nuevoUsuario);
router.route('/login').post(usuariosController.loginUsuario);
router.route('/').get(usuariosController.listaUsuarios);
// router.route('/q/').get(usuariosController.getUsuarioByAlias);
// router.route('/q/').get(usuariosController.getUsuarioAlias);

// router.post('/usuarios/nuevo', usuariosController.nuevoUsuario)

module.exports = router;