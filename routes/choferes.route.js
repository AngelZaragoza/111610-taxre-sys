const express = require("express");
const router = express.Router();

const choferesController = require("../controllers/choferes.controller");
const personasController = require("../controllers/personas.controller");

router.route("/").get(choferesController.listaChoferes);

router
  .route("/nuevo")
  .post(choferesController.nuevoChoferFull)
  .put(choferesController.nuevoChoferDesdeAdh);

module.exports = router;
