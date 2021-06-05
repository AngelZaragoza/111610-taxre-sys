const express = require("express");
const router = express.Router();
// const passport = require("passport");

const adherentesController = require("../controllers/adherentes.controller");
const personasController = require("../controllers/personas.controller");

router.route("/").get(adherentesController.listaAdherentes);
router
  .route("/detalle/:id")
  .get(adherentesController.detalleAdherente)
  .put(personasController.updatePersona)
  .patch(adherentesController.updateAdherente);

router.route("/nuevo").post(adherentesController.nuevoAdherenteFull);

module.exports = router;
