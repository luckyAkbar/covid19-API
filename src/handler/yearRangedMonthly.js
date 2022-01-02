const CovidAPI = require('../class/CovidAPI');

const yearRangedMonthlyHandler = async (req, res) => {
  const { year } = req.params;
  const { since, upto } = req.query;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getYearRangedMonthlyData(year, since, upto);

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

module.exports = yearRangedMonthlyHandler;
