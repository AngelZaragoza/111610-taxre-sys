const express = require("express");
const router = express.Router();
const authGuard = require("../lib/authguard"); //Chequeo antes de cada peticion

const jornadasController = require("../controllers/jornadas.controller");

/*
router.route("/fechas").get(jornadasController.pruebaConsultaFecha);
router.route("/turnos").get(jornadasController.turnosOperadores);
router
  .route("/operadores")
  .post(jornadasController.inicioTurno)
  .patch(jornadasController.cierreTurno);
*/

module.exports = router;
