const CovidAPI = require('../class/CovidAPI');

const rangedYearly = async (req, res) => {
  const { since, upto } = req.query;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getRangedYearlyData({ since, upto });

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

module.exports = rangedYearly;
