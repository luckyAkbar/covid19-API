const CovidAPI = require('../class/CovidAPI');

const updateHandler = async (req, res) => {
  const covidAPI = new CovidAPI();

  try {
    const updateData = await covidAPI.getGeneralUpdate();
    res.status(covidAPI.status).json(updateData);
  } catch (e) {
    res.status(covidAPI.status).json({
      ok: covidAPI.ok,
      message: covidAPI.message,
    });
  }
};

module.exports = updateHandler;
