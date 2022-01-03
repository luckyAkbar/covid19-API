const express = require('express');
const updateHandler = require('../handler/update');
const yearlyHandlerHandler = require('../handler/yearly');
const rangedYearly = require('../handler/rangedYearly');
const monthlyHanlder = require('../handler/monthly');
const yearRangedMonthlyHandler = require('../handler/yearRangedMonthly');
const dailyHandler = require('../handler/daily');
const dailyWithYearHandler = require('../handler/dailyWithYear');
const dailyWithYearAndMonth = require('../handler/dailyWithYearAndMonth');
const dailyWithYearMonthAndDate = require('../handler/dailyWithYearMonthAndDate');
const monthlyWithYearAndMonth = require('../handler/monthlyWithYearAndMonth');

const router = express.Router();

router.route('/')
  .get(updateHandler);

router.route('/yearly')
  .get(rangedYearly);

router.route('/yearly/:year')
  .get(yearlyHandlerHandler);

router.route('/monthly')
  .get(monthlyHanlder);

router.route('/monthly/:year')
  .get(yearRangedMonthlyHandler);

router.route('/monthly/:year/:month')
  .get(monthlyWithYearAndMonth);

router.route('/daily')
  .get(dailyHandler);

router.route('/daily/:year')
  .get(dailyWithYearHandler);

router.route('/daily/:year/:month')
  .get(dailyWithYearAndMonth);

router.route('/daily/:year/:month/:date')
  .get(dailyWithYearMonthAndDate);

router.route('*')
  .all((req, res) => {
    res.status(404).json({ message: 'Invalid endpoint requested with forbidden method.' });
  });

module.exports = router;
