const express = require("express");
const router = express.Router();

const movilesController = require("../controllers/moviles.controller");

router.route("/").get(movilesController.listaMoviles);
router.route("/tipos").get(movilesController.listaTipos);

module.exports = router;