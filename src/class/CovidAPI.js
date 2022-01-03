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

  async getDailyData(since, upto) {
    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);

      const { harian: covidData } = response.data.update;
      const dailyData = this._extractDailyData(covidData, since, upto);

      return dailyData;
    } catch (e) {
      this.ok = false;
      this.message = 'We failed to get your data due to 3rd party service returning error';
      this.status = 503;

      throw e;
    }
  }

  async getDailyWithYearData(yearParams, since, upto) {
    const year = this._validateYearParamsInDaily(yearParams);
    const params = this._extractDailyParams(since, upto, {
      defaultSince: {
        year,
        month: 1,
        date: 1,
      },
      defaultUpto: {
        year,
        month: 12,
        date: 31,
      },
    });
    const validatedSince = this._validateDailyParams({
      year,
      month: 1,
      date: 1,
    }, params.since);
    const validatedUpto = this._validateDailyParams({
      year,
      month: 12,
      date: 31,
    }, params.upto);

    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);
      const { harian: covidData } = response.data.update;

      const result = this._extractDailyDataFromAPI(covidData, validatedSince, validatedUpto);

      return result;
    } catch (e) {
      this.ok = false;
      this.status = 503;
      this.message = 'Your request failed because 3rd party API returning error message.';

      throw e;
    }
  }

  async getDailyWithYearAndMonthData(yearParam, monthParam, since, upto) {
    const year = this._validateYearParamsInDaily(yearParam);
    const month = this._validateMonthParamsInDaily(monthParam);
    const params = this._extractDailyParams(since, upto, {
      defaultSince: {
        year,
        month,
        date: 1,
      },
      defaultUpto: {
        year,
        month,
        date: dayjs(`${year}-${month}`).daysInMonth(),
      },
    });
    const validatedSince = this._validateDailyParams({
      year,
      month,
      date: 1,
    }, params.since);
    const validatedUpto = this._validateDailyParams({
      year,
      month,
      date: dayjs(`${year}-${month}`).daysInMonth(),
    }, params.upto);

    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);
      const { harian: covidData } = response.data.update;

      const result = this._extractDailyDataFromAPI(covidData, validatedSince, validatedUpto);

      return result;
    } catch (e) {
      this.ok = false;
      this.status = 503;
      this.message = 'Your request failed because 3rd party API returning error message.';

      throw e;
    }
  }

  async getDailyWithYearMonthAndDate(yearParam, monthParam, dateParam) {
    const year = this._validateYearParamsInDaily(yearParam);
    const month = this._validateMonthParamsInDaily(monthParam);
    const date = this._validateDateParamsInDaily(dateParam, dayjs(`${year}-${month}`).daysInMonth());
    const exactDate = new Date(`${year}-${month}-${date}`);
    exactDate.setUTCHours(0, 0, 0, 0);

    console.log(exactDate.toString());

    try {
      const response = await axios.get('https://data.covid19.go.id/public/api/update.json');
      assert.strictEqual(response.status, 200);
      const { harian: covidData } = response.data.update;

      for (let i = 0; i < covidData.length; i++) {
        const targetDate = new Date(covidData[i].key_as_string);
        console.log(targetDate.toString())

        if (targetDate.toString() === exactDate.toString()) {
          return {
            date: `${year}-${month}-${date}`,
            positive: covidData[i].jumlah_positif_kum.value,
            recovered: covidData[i].jumlah_sembuh_kum.value,
            deaths: covidData[i].jumlah_meninggal_kum.value,
            active: covidData[i].jumlah_dirawat_kum.value,
          }
        }
      }

      throw new Error();
    } catch (e) {
      this.ok = false;
      this.message = 'We failed to get the Covid data from the given params.';
      this.status = 404;

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

  _extractMonthlyData(fetchResult, since, upto) {
    const monthlyData = [];
    const { harian: dailyCovidData } = fetchResult.update;

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

  _extractYearAndMonthFromYearlyRangedMonthlyQuery(yearQuery, since, upto) {
    const rangedMonthlyQuery = {
      year: 2020,
      since: {
        year: 2020,
        month: 1,
      },
      upto: {
        year: 2020,
        month: 12,
      },
    };

    try {
      const numYearQuery = Number(yearQuery);

      if (Number.isNaN(numYearQuery) || numYearQuery < 2020 || numYearQuery > this.currentYear) {
        rangedMonthlyQuery.year = 2020;
        rangedMonthlyQuery.since.year = 2020;
        rangedMonthlyQuery.upto.year = 2020;
        this.message = 'We detect error value in your URL params. So we decided to send response in year 2020.';
      } else {
        rangedMonthlyQuery.year = numYearQuery;
        rangedMonthlyQuery.since.year = numYearQuery;
        rangedMonthlyQuery.upto.year = numYearQuery;
      }

      const yearSince = Number(since.split('.')[0]);
      const monthSince = Number(since.split('.')[1]);
      const yearUpto = Number(upto.split('.')[0]);
      const monthUpto = Number(upto.split('.')[1]);

      if (yearSince >= 2020 || yearSince <= this.currentYear) rangedMonthlyQuery.since.year = yearSince;
      if (yearUpto >= 2020 || yearUpto <= this.currentYear) rangedMonthlyQuery.upto.year = yearUpto;
      if (monthSince >= 1 || monthSince <= this.currentMonth) rangedMonthlyQuery.since.month = monthSince;
      if (monthUpto >= 1 || monthUpto <= this.currentMonth) rangedMonthlyQuery.upto.month = monthUpto;

      if ((rangedMonthlyQuery.year !== rangedMonthlyQuery.since.year) || (rangedMonthlyQuery.year !== rangedMonthlyQuery.upto.year)) {
        rangedMonthlyQuery.since.year = rangedMonthlyQuery.year;
        rangedMonthlyQuery.upto.year = rangedMonthlyQuery.year;
        rangedMonthlyQuery.since.month = 1;
        rangedMonthlyQuery.upto.month = 12;
        this.message = 'We detect inconsistencies beteween year in your URL params and query, so we decided to give you result according to your validated URL params';
      }
    } catch (e) {
      this.message = 'We detect absence wheter in your query or URL params. So we decide to give you default response. Please refer to our docs to see the correct usage.';
    } finally {
      return rangedMonthlyQuery;
    }
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

  _extractDailyData(fetchResult, since, upto) {
    const dailyData = [];
    const params = this._extractDailyParams(since, upto, {
      defaultSince: {
        year: 2020,
        month: 3,
        date: 2,
      },
      defaultUpto: {
        year: this.currentYear,
        month: this.currentMonth,
        date: this.currentDate,
      },
    });
    const validatedSince = this._validateDailyParams({
      year: 2020,
      month: 3,
      date: 2,
    }, params.since);
    const validatedUpto = this._validateDailyParams({
      year: this.currentYear,
      month: this.currentMonth,
      date: this.currentDate,
    }, params.upto);

    for (let i = 0; i < fetchResult.length; i++) {
      const targetDate = new Date(fetchResult[i].key_as_string);

      if (targetDate >= validatedSince.dateValue && targetDate <= validatedUpto.dateValue) {
        dailyData.push({
          date: `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`,
          positive: fetchResult[i].jumlah_positif_kum.value,
          recovered: fetchResult[i].jumlah_sembuh_kum.value,
          deaths: fetchResult[i].jumlah_meninggal_kum.value,
          active: fetchResult[i].jumlah_dirawat_kum.value,
        });
      }
    }

    return dailyData;
  }

  _validateDailyParams(defaultParams, { year, month, date }) {
    const validatedParams = {
      year: defaultParams.year,
      month: defaultParams.month,
      date: defaultParams.date,
      dateValue: null,
    };

    if (year) validatedParams.year = year;
    if (month) validatedParams.month = month;
    if (date) validatedParams.date = date;

    const testDate = new Date(`${year}-${month}-${date}`);

    if (testDate.toString() === 'Invalid Date') {
      validatedParams.year = defaultParams.year;
      validatedParams.month = defaultParams.month;
      validatedParams.date = defaultParams.date;
    }

    validatedParams.dateValue = new Date(`${year}-${month}-${date}`);
    validatedParams.dateValue.setUTCHours(0, 0, 0, 0);

    return validatedParams;
  }

  _extractDailyDataFromAPI(fetchResult, validatedSince, validatedUpto) {
    const dailyData = [];

    for (let i = 0; i < fetchResult.length; i++) {
      const targetDate = new Date(fetchResult[i].key_as_string);

      if (targetDate > validatedSince.dateValue && targetDate <= validatedUpto.dateValue) {
        dailyData.push({
          ts: fetchResult[i].key_as_string,
          date: `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`,
          positive: fetchResult[i].jumlah_positif_kum.value,
          recovered: fetchResult[i].jumlah_sembuh_kum.value,
          deaths: fetchResult[i].jumlah_meninggal_kum.value,
          active: fetchResult[i].jumlah_dirawat_kum.value,
        });
      }
    }

    return dailyData;
  }

  _validateYearParamsInDaily(year) {
    try {
      if (Number(year) < 2020) return 2020;
      if (Number(year) > this.currentYear) return this.currentYear;

      return Number(year);
    } catch (e) {
      this.message = 'Invalid value detected on year URL params';
      return 2020;
    }
  }

  _validateMonthParamsInDaily(month) {
    try {
      const numMonth = Number(month);
      assert.notStrictEqual((numMonth < 1 || numMonth > 12), true);
      assert.notStrictEqual(Number.isNaN(numMonth), true);

      return numMonth;
    } catch (e) {
      this.message = 'You use wrong URL params in "month". So we decided to give you the result from this current month of the year supplied in "year" URL params (if it is valid)';

      return this.currentMonth;
    }
  }

  _validateDateParamsInDaily(date, maxDate) {
    const numDate = Number(date);

    try {
      assert.notStrictEqual((numDate < 1 || numDate > maxDate), true);
      assert.notStrictEqual(Number.isNaN(numDate), true);

      return numDate;
    } catch (e) {
      this.message = 'We detect error on your "date" URL params. So, we decided to give result from the first day of the month';

      return 1;
    }
  }

  _extractDailyParams(since, upto, {
    defaultSince = {
      year: 2020,
      month: 3,
      date: 2,
    },
    defaultUpto = {
      year: this.currentYear,
      month: this.currentMonth,
      date: this.currentDate,
    },
  }) {
    try {
      const sinceParams = since.split('.');
      const yearSince = sinceParams[0];
      const monthSince = sinceParams[1];
      const dateSince = sinceParams[2];

      const uptoParams = upto.split('.');
      const yearUpto = uptoParams[0];
      const monthUpto = uptoParams[1];
      const dateUpto = uptoParams[2];

      return {
        since: {
          year: yearSince,
          month: monthSince,
          date: dateSince,
        },
        upto: {
          year: yearUpto,
          month: monthUpto,
          date: dateUpto,
        },
      };
    } catch (e) {
      return {
        since: {
          year: defaultSince.year,
          month: defaultSince.month,
          date: defaultSince.date,
        },
        upto: {
          year: defaultUpto.year,
          month: defaultUpto.month,
          date: defaultUpto.date,
        },
      };
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
