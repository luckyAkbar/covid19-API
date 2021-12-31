const CovidAPI = require('../class/CovidAPI');

const yearlyHandler = async (req, res) => {
  const { year } = req.params;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getYearlyData(year);

    res.status(200).json({
      ok: covidAPI.ok,
      message: covidAPI.message,
      data: result,
    });
  } catch (e) {
    res.status(covidAPI.status).json({
      message: covidAPI.message,
      ok: covidAPI.ok,
    });
  }
};

module.exports = yearlyHandler;
