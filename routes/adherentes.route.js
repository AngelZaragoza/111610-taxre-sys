const express = require("express");
const router = express.Router();
const authGuard = require("../lib/authguard.middleware"); //Chequeo antes de cada peticion

const adherentesController = require("../controllers/adherentes.controller");
const personasController = require("../controllers/personas.controller");

router
  .route("/")
  .get(authGuard, adherentesController.listaAdherentes)
  .post(authGuard, adherentesController.nuevoAdherenteFull);
router
  .route("/detalle/:id")
  .get(authGuard, adherentesController.detalleAdherente)
  .put(authGuard, personasController.updatePersona)
  .patch(authGuard, adherentesController.updateAdherente);

module.exports = router;
