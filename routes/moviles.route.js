const express = require("express");
const router = express.Router();
const authGuard = require("../lib/authguard.middleware"); //Chequeo antes de cada peticion

const movilesController = require("../controllers/moviles.controller");

router
  .route("/")
  .get(authGuard, movilesController.listaMoviles)
  .post(authGuard, movilesController.nuevoMovilFull);

router
  .route("/detalle/:id")
  .get(authGuard, movilesController.detalleMovil)
  .patch(authGuard, movilesController.updateMovil);

router.route("/tipos").get(authGuard, movilesController.listaTipos);

module.exports = router;
