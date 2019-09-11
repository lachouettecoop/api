const mem = require("mem");
const got = require("got");
const csv = require("neat-csv");
const isSameDay = require("date-fns/isSameDay");
const isWithinInterval = require("date-fns/isWithinInterval");
const eachDayOfInterval = require("date-fns/eachDayOfInterval");
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
    const interval = { start: from, end: to };

    const joursExistants = planning.filter(jour =>
      isWithinInterval(jour.getDate(), interval)
    );

    return eachDayOfInterval(interval).map(
      date =>
        joursExistants.find(jour => isSameDay(jour.getDate(), date)) || {
          getDate: () => date,
          isOpened: () => false
        }
    );
  }
}

module.exports = PlanningAPI;
