const CovidAPI = require('../class/CovidAPI');

const monthlyHandler = async (req, res) => {
  const { since, upto } = req.query;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getMonthlyData(since, upto);

    res.status(covidAPI.status).json({
      ok: covidAPI.ok,
      data: result,
      message: covidAPI.message,
    });
  } catch (e) {
    res.status(covidAPI.status).json({ message: covidAPI.message });
  }
};

module.exports = monthlyHandler;
