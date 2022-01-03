const CovidAPI = require('../class/CovidAPI');

const dailyWithYearMonthAndDate = async (req, res) => {
  const { year, month, date } = req.params;
  const covidAPI = new CovidAPI();

  try {
    const result = await covidAPI.getDailyWithYearMonthAndDate(year, month, date);

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

module.exports = dailyWithYearMonthAndDate;
