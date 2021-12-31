const assert = require('assert').strict;
const axios = require('axios').default;

class CovidAPI {
  constructor() {
    this.status = 200;
    this.ok = true;
    this.message = 'Request success!';
  }

  async getGeneralUpdate() {
    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.notStrictEqual((response.status !== 200), true);

      const { data } = response;

      return {
        ok: this.ok,
        status: this.status,
        message: this.message,
        lastUpdated: data.update.penambahan.tanggal,
        data: {
          total_positive: data.update.total.jumlah_positif,
          total_recovered: data.update.total.jumlah_sembuh,
          total_deaths: data.update.total.jumlah_meninggal,
          total_active: data.update.total.jumlah_dirawat,
          new_positive: data.update.penambahan.jumlah_positif,
          new_recovered: data.update.penambahan.jumlah_sembuh,
          new_deaths: data.update.penambahan.jumlah_meninggal,
          new_active: data.update.penambahan.jumlah_dirawat,
        },
      };
    } catch (e) {
      this.ok = false;
      this.status = 503;
      throw new Error('Service unavailable due to 3rd party API error.');
    }
  }
}

module.exports = CovidAPI;
