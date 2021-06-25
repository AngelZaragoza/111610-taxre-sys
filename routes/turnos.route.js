const express = require("express");
const router = express.Router();
const authGuard = require("../lib/authguard"); //Chequeo antes de cada peticion

const turnosController = require("../controllers/turnos.controller");

router.route("/fechas").get(turnosController.pruebaConsultaFecha);
router.route("/").get(authGuard, turnosController.turnosOperadores);
router
  .route("/inout")
  .get(authGuard, turnosController.getTurnoActivo)
  .post(authGuard, turnosController.getTurnoActivo, turnosController.inicioTurno)
  .patch(authGuard, turnosController.cierreTurno);

module.exports = router;
