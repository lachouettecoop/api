const mem = require("mem");
const got = require("got");
const csv = require("neat-csv");
const isSameDay = require("date-fns/isSameDay");
const isWithinInterval = require("date-fns/isWithinInterval");
const eachDayOfInterval = require("date-fns/eachDayOfInterval");
const addMinutes = require("date-fns/addMinutes");
const subMinutes = require("date-fns/subMinutes");
const toPlanning = require("./toPlanning");

const UNE_MINUTE = 60 * 1000;
const memoizedGot = mem(got, {
  maxAge: UNE_MINUTE
});

const parseCSV = response => {
  return csv(response.body, {
    headers: false
  });
};

class PlanningAPI {
  constructor(sheetUrl) {
    this.url = sheetUrl;
  }

  async getAll() {
    return memoizedGot(this.url)
      .then(parseCSV)
      .then(toPlanning);
  }

  async getPeriode(from, to) {
    const planning = await this.getAll();

    const interval = {
      start: from,
      end: to
    };

    const joursExistants = planning.filter(jour =>
      isWithinInterval(jour.getDate(), interval)
    );

    // Hack to prevent incorrect timezone bugs and return 1 day before the expected start date
    // see https://github.com/date-fns/date-fns/issues/556#issuecomment-391048347
    // … we had to do the opposite!
    const fixTimezoneOffset = date => {
      const offset = date.getTimezoneOffset();
      return Math.sign(offset) === -1
        ? addMinutes(date, Math.abs(offset))
        : subMinutes(date, Math.abs(offset));
    };

    return eachDayOfInterval(interval)
      .map(fixTimezoneOffset)
      .map(
        date =>
          joursExistants.find(jour => isSameDay(jour.getDate(), date)) || {
            getDate: () => date,
            isOpened: () => false
          }
      );
  }

  async getJour(date) {
    const planning = await this.getAll();
    const jour = planning.find(jour => isSameDay(date, jour.getDate()));

    return jour || { getDate: () => date, isOpened: () => false };
  }
}

module.exports = PlanningAPI;
