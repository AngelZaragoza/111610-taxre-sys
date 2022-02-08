const express = require('express');
const router = express.Router();
const authGuard = require('../lib/authguard.middleware'); //Chequeo antes de cada peticion

const jornadasController = require('../controllers/jornadas.controller');

router.route('/').get(authGuard, jornadasController.jornadasActivas);
router
  .route('/rangofechas')
  .get(authGuard, jornadasController.jornadasMovilesRangoFechas);
router
  .route('/iniciofin')
  .post([
    authGuard, 
    jornadasController.chequearJornada, 
    jornadasController.inicioJornada
  ])
  .patch([
    authGuard,
    jornadasController.chequearJornada,
    jornadasController.cierreJornada,
  ]);
router.route('/detalle/:id').get(authGuard, jornadasController.detalleJornada);

module.exports = router;
