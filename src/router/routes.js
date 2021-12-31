const express = require('express');
const updateHandler = require('../handler/update');
const yearlyHandler = require('../handler/yearly');

const router = express.Router();

router.route('/')
  .get(updateHandler);

router.route('/yearly/:year')
  .get(yearlyHandler);

router.route('*')
  .all((req, res) => {
    res.status(404).json({ message: 'Invalid endpoint requested with forbidden method.' });
  });

module.exports = router;
