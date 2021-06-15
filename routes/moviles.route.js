const express = require("express");
const router = express.Router();

const movilesController = require("../controllers/moviles.controller");

router.route("/").get(movilesController.listaMoviles);
router.route("/tipos").get(movilesController.listaTipos);
router
  .route("/detalle/:id")
  .get(movilesController.detalleMovil)
  .patch(movilesController.updateMovil);

router.route("/nuevo").post(movilesController.nuevoMovilFull);

module.exports = router;
