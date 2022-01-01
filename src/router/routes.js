const express = require('express');
const updateHandler = require('../handler/update');
const yearlyHandlerHandler = require('../handler/yearly');
const rangedYearly = require('../handler/rangedYearly');

const router = express.Router();

router.route('/')
  .get(updateHandler);

router.route('/yearly')
  .get(rangedYearly);

router.route('/yearly/:year')
  .get(yearlyHandlerHandler);

router.route('*')
  .all((req, res) => {
    res.status(404).json({ message: 'Invalid endpoint requested with forbidden method.' });
  });

module.exports = router;
