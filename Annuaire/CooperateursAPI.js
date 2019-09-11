const mem = require("mem");
const got = require("got");
const csv = require("neat-csv");

const UNE_HEURE = 60 * 60 * 1000;
const memoizedGot = mem(got, {
  maxAge: UNE_HEURE
});

const parseCSV = response => {
  return csv(response.body, {
    headers: false,
    skipLines: 4
  });
};

const formatMembres = data => {
  return (
    data
      .map(row => ({
        lastname: row[3].toLocaleUpperCase(),
        firstname: row[4],
        email: row[5],
        phone: row[6],
        subscribedOn: row[7]
      }))
      // TODO Make localeCompare work on the server
      .sort((a, b) => a.lastname.localeCompare(b.lastname))
  );
};

class CooperateursAPI {
  constructor(sheetURL) {
    this.url = sheetURL;
  }

  async getAll() {
    return memoizedGot(this.url)
      .then(parseCSV)
      .then(formatMembres);
  }
}

module.exports = CooperateursAPI;
