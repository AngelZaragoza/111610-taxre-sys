const express = require("express");
const router = express.Router();
const authGuard = require("../lib/authguard.middleware");

const turnosController = require("../controllers/turnos.controller");

//Listados
router.route("/estado-fechas").get(authGuard, turnosController.estadoTurnosFechas);
router.route("/ultimos").get(authGuard, turnosController.ultimosNTurnos);

//Operaciones
router
  .route("/inout")
  .get(authGuard, turnosController.getTurnoActivo)
  .post(authGuard, turnosController.getTurnoActivo, turnosController.inicioTurno)
  .patch(authGuard, turnosController.getTurnoActivo, turnosController.cierreTurno);

module.exports = router;
