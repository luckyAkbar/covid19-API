const CovidAPI = require('../class/CovidAPI');

const monthlyWithYearAndMonth = async (req, res) => {
  const { year, month } = req.params;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getYearAndMonthRangedMonthlyData(year, month);

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

module.exports = monthlyWithYearAndMonth;
