const assert = require('assert').strict;
const axios = require('axios').default;
const dayjs = require('dayjs');
const isToday = require('dayjs/plugin/isToday');

dayjs.extend(isToday);

class CovidAPI {
  constructor() {
    this.status = 200;
    this.ok = true;
    this.defaultCovidYearDetected = 2020;
    this.currentTime = new Date();
    this.currentYear = this.currentTime.getFullYear();
    this.currentMonth = this.currentTime.getMonth() + 1;
    this.currentDate = this.currentTime.getDate();
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

      return yearlyData;
    } catch (e) {
      this.message = `Yearly Covid19 Case in Indonesia for year ${year} is not found`;
      this.ok = false;
      this.status = 404;

      throw e;
    }
  }

  async getRangedYearlyData({ since = 2020, upto = this.currentYear }) {
    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);

      const { data } = response;

      const rangedYearlyData = this._extractRangedYearlyData(data, since, upto);
      return rangedYearlyData;
    } catch (e) {
      this.ok = false;
      this.message = 'We failed to fulfill your request 3rd party service returning error status';

      throw e;
    }
  }

  async getMonthlyData(querySince, queryUpto) {
    const { since, upto } = this._validateMonthlySinceAndUpto({
      actualSince: querySince,
      actualUpto: queryUpto,
    });

    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);

      const { data } = response;
      const monthlyData = this._extractMonthlyData(data, since, upto);

      return monthlyData;
    } catch (e) {
      this.ok = false;
      this.message = 'We failed to response to your request due to 3rd party service returning error message.';
      this.status = 503;

      throw e;
    }
  }

  async getYearRangedMonthlyData(yearParams, querySince, queryUpto) {
    const { since, upto } = this._extractYearAndMonthFromYearlyRangedMonthlyQuery(yearParams, querySince, queryUpto);

    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);

      const { data } = response;
      const rangedYearMonthlyData = this._extractMonthlyData(data, since, upto);

      return rangedYearMonthlyData;
    } catch (e) {
      this.ok = false;
      this.message = 'We failed to response to your request due to 3rd party service returning error message.';
      this.status = 503;

      throw e;
    }
  }

  _extractRangedYearlyData(fetchResult, since, upto) {
    const yearInBetween = this._generateYearInBetween(since, upto);
    const extractedRangedYearlyData = [];

    for (let i = 0; i < yearInBetween.length; i++) {
      const yearlyData = this._extractYearlyData(fetchResult, yearInBetween[i]);

      extractedRangedYearlyData.push(yearlyData);
    }

    return extractedRangedYearlyData;
  }

  _extractYearlyData(fetchResult, year) {
    this.targetYear = this._validateTargetYear(year);
    const data = fetchResult.update.harian;
    const endOfYear = this._generateEndOfYearDateString();

    for (let i = 0; i < data.length; i++) {
      if (data[i].key_as_string === endOfYear) {
        return {
          year: this.targetYear,
          timestamp: data[i].key_as_string,
          positive: data[i].jumlah_positif_kum.value,
          recovered: data[i].jumlah_sembuh_kum.value,
          deaths: data[i].jumlah_meninggal_kum.value,
          active: data[i].jumlah_dirawat_kum.value,
        };
      }
    }

    return {};
  }

  _extractMonthlyData(fetchResult, querySince, queryUpto) {
    const monthlyData = [];
    const { harian: dailyCovidData } = fetchResult.update;
    const { since, upto } = this._validateMonthlySinceAndUpto({
      actualSince: querySince,
      actualUpto: queryUpto,
    });

    for (let i = 0; i < dailyCovidData.length; i++) {
      const yearKey = Number(dailyCovidData[i].key_as_string.split('-')[0]);
      const monthKey = Number(dailyCovidData[i].key_as_string.split('-')[1]);
      const dateKey = Number(dailyCovidData[i].key_as_string.split('-')[2].split('T')[0]);
      const lastDayInMonth = dayjs(`${yearKey}-${monthKey}`).daysInMonth();
      const isThisDay = dayjs(`${yearKey}-${monthKey}-${this.currentDate}`).isToday();

      if (!(dateKey === lastDayInMonth || (isThisDay && dateKey === this.currentDate))) continue;

      if (yearKey === since.year && monthKey >= since.month) {
        if (since.year === upto.year && monthKey > upto.month) continue;

        monthlyData.push({
          month: `${yearKey}-${monthKey}`,
          positive: dailyCovidData[i].jumlah_positif_kum.value,
          recovered: dailyCovidData[i].jumlah_sembuh_kum.value,
          deaths: dailyCovidData[i].jumlah_meninggal_kum.value,
          active: dailyCovidData[i].jumlah_dirawat_kum.value,
        });

        continue;
      }

      if (yearKey === upto.year && monthKey <= upto.month) {
        if (since.year === upto.year && monthKey < since.month) continue;

        monthlyData.push({
          month: `${yearKey}-${monthKey}`,
          positive: dailyCovidData[i].jumlah_positif_kum.value,
          recovered: dailyCovidData[i].jumlah_sembuh_kum.value,
          deaths: dailyCovidData[i].jumlah_meninggal_kum.value,
          active: dailyCovidData[i].jumlah_dirawat_kum.value,
        });

        continue;
      }

      if (yearKey > since.year && yearKey < upto.year) {
        monthlyData.push({
          month: `${yearKey}-${monthKey}`,
          positive: dailyCovidData[i].jumlah_positif_kum.value,
          recovered: dailyCovidData[i].jumlah_sembuh_kum.value,
          deaths: dailyCovidData[i].jumlah_meninggal_kum.value,
          active: dailyCovidData[i].jumlah_dirawat_kum.value,
        });
      }
    }

    return monthlyData;
  }

  _generateYearInBetween(since, upto) {
    const targetYearSince = Number(this._validateTargetYear(since));
    const targetYearUpto = Number(this._validateTargetYear(upto));
    const yearInBetween = [];

    for (let i = targetYearSince; i <= targetYearUpto; i++) {
      yearInBetween.push(i);
    }

    return yearInBetween;
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

  _validateMonthlySinceAndUpto({
    actualSince,
    actualUpto,
    defaultSince = { year: 2020, month: 3 },
    defaultUpto = { year: this.currentYear, month: this.currentMonth },
  }) {
    const validateMonthlySinceAndUpto = {
      since: {
        year: null,
        month: null,
      },
      upto: {
        year: null,
        month: null,
      },

      validate(currentYear, currentMonth) {
        if (this.since.year < 2020 || this.since.year > currentYear) {
          this.since.year = 2020;
          this.since.month = 3;
        }

        if (this.upto.year > currentYear || this.upto.year < 2000) {
          this.upto.year = currentYear;
          this.upto.month = currentMonth;
        }

        if (this.since.month < 1 || this.since.month > 12) this.since.month = 1;
        if (this.upto.month < 1 || this.upto.month > 12) this.upto.month = 12;
      },
    };

    try {
      // assertion below will make since / actual
      // params can be used years later.
      // probably until the earth is no longer
      // liveable anymore lol. also it prevent
      // potential bug if user supply really long value
      // in params (run out of memory)

      assert.notStrictEqual(defaultSince, undefined);
      assert.notStrictEqual(defaultUpto, undefined);
      assert.strictEqual((actualSince.length < 10), true);
      assert.strictEqual((actualUpto.length < 10), true);

      const yearSince = Number(actualSince.split('.')[0]);
      const monthSince = Number(actualSince.split('.')[1]);
      const yearUpto = Number(actualUpto.split('.')[0]);
      const monthUpto = Number(actualUpto.split('.')[1]);

      validateMonthlySinceAndUpto.since.year = Number.isNaN(yearSince) ? defaultSince.year : yearSince;
      validateMonthlySinceAndUpto.since.month = Number.isNaN(monthSince) ? defaultSince.month : monthSince;
      validateMonthlySinceAndUpto.upto.year = Number.isNaN(yearUpto) ? defaultUpto.year : yearUpto;
      validateMonthlySinceAndUpto.upto.month = Number.isNaN(monthUpto) ? defaultUpto.month : monthUpto;
    } catch (e) {
      validateMonthlySinceAndUpto.since = defaultSince;
      validateMonthlySinceAndUpto.upto = defaultUpto;

      this.message = 'This response is the server default response because we detect error / absence in your since and upto query.';
    } finally {
      validateMonthlySinceAndUpto.validate(this.currentYear, this.currentMonth);
      return validateMonthlySinceAndUpto;
    }
  }

  _generateYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(this.currentDate - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    return yesterday;
  }

  _generateEndOfYearDateString() {
    if (!(Number(this.targetYear) === this.currentYear)) return JSON.stringify(new Date(`${this.targetYear}-12-31`)).replace(/"/g, '');

    return JSON.stringify(this._generateYesterdayDate()).replace(/"/g, '');
  }
}

module.exports = CovidAPI;
