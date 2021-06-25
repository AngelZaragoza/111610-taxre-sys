const express = require("express");
const router = express.Router();
const authGuard = require("../lib/authguard"); //Chequeo antes de cada peticion

const choferesController = require("../controllers/choferes.controller");
const personasController = require("../controllers/personas.controller");

router.route("/").get(authGuard, choferesController.listaChoferes);

router
  .route("/nuevo")
  .post(authGuard, choferesController.nuevoChoferFull)
  .put(authGuard, choferesController.nuevoChoferDesdeAdh);

module.exports = router;
