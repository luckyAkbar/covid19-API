const assert = require('assert').strict;
const axios = require('axios').default;
const dayjs = require('dayjs');

class CovidAPI {
  constructor() {
    this.status = 200;
    this.ok = true;
    this.defaultCovidYearDetected = 2020;
    this.currentTime = new Date();
    this.currentYear = this.currentTime.getFullYear();
    this.message = 'Request success!';
    this.targetYear = null;
  }

  async getGeneralUpdate() {
    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);

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
      this.message = 'Service unavailable due to 3rd party API error.';

      throw new Error();
    }
  }

  async getYearlyData(year) {
    try {
      const result = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(result.status, 200);

      const { data } = result;
      const yearlyData = this._extractYearlyData(data, year);

      return {
        year: this.targetYear,
        timestamp: yearlyData.key_as_string.value,
        positive: yearlyData.jumlah_positif_kum.value,
        recovered: yearlyData.jumlah_sembuh_kum.value,
        deaths: yearlyData.jumlah_meninggal_kum.value,
        active: yearlyData.jumlah_dirawat_kum.value,
      };
    } catch (e) {
      this.message = `Yearly Covid19 Case in Indonesia for year ${year} is not found`;
      this.ok = false;
      this.status = 404;

      throw e;
    }
  }

  _extractYearlyData(fetchResult, year) {
    this.targetYear = this._validateTargetYear(year);
    const data = fetchResult.update.harian;
    const endOfYear = this._generateEndOfYearDateString(this.targetYear);

    for (let i = 0; i < data.length; i++) {
      if (data[i].key_as_string === endOfYear) {
        return data[i];
      }
    }

    throw new Error();
  }

  _validateTargetYear(year) {
    const targetYear = Number(year);

    if (targetYear < 2020) {
      this.message = `You queried for year ${targetYear}, but since Covid starts detected in indonesia on 2020, we choose to provide the data in first year of Covid pandemic.`;
      return '2020';
    }

    if (targetYear > this.currentYear) {
      this.message = `You queried for year ${targetYear}, because we are unable to predict the future, we choose to provide Covid data until this recent year.`;
      return `${this.currentYear}`;
    }

    return year;
  }

  _generateEndOfYearDateString(targetYear) {
    if (!targetYear === this.currentYear) return JSON.stringify(new Date(`${targetYear}-12-31`)).replace(/"/g, '');

    const month = this.currentTime.getMonth();
    const date = this.currentTime.getDate();

    return JSON.stringify(new Date(`${targetYear}-${month}-${date - 1}`)).replace(/"/g, '');
  }
}

module.exports = CovidAPI;
