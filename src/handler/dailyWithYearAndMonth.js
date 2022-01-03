const CovidAPI = require('../class/CovidAPI');

const dailyWithYearAndMonth = async (req, res) => {
  const { year, month } = req.params;
  const { since, upto } = req.query;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getDailyWithYearAndMonthData(year, month, since, upto);

    res.status(covidAPI.status).json({
      ok: covidAPI.ok,
      message: covidAPI.message,
      data: result,
    });
  } catch (e) {
    res.status(covidAPI.status).json({
      ok: covidAPI.ok,
      message: covidAPI.message,
    });
  }
};

module.exports = dailyWithYearAndMonth;
