const GoogleSpreadsheet = require("google-spreadsheet");
const mem = require("mem");
const parse = require("date-fns/parse");

const fetchAllRows = (doc, credentials, sheetTitle, transformResult) =>
  new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(credentials, () => {
      doc.getInfo((err, info) => {
        if (err) reject(err);

        const sheet = info.worksheets.find(sheet => sheet.title === sheetTitle);
        if (!sheet) {
          reject(`Aucune feuille trouvée avec le nom "${sheetTitle}"`);
        }

        sheet.getRows({}, (err, rows) => {
          if (err) reject(err);
          resolve(transformResult(rows));
        });
      });
    });
  });

const UNE_HEURE = 60 * 60 * 1000;
const memoizedRows = mem(fetchAllRows, {
  maxAge: UNE_HEURE
});

const dateOuVide = value => {
  if (value === "-") {
    return null;
  }
  return parse(value, "dd/MM/yyyy", new Date());
};

const formatParticipation = row => {
  return {
    id: row.id,
    email: row.mail.trim(),

    dateDernierePIAF: dateOuVide(row.derniertafeffectué),
    dateProchainePIAF: dateOuVide(row.prochaintaf),

    nombrePIAFOk: row.nbtafok === "OK",
    nombrePIAFDepuis2018: Number(row.nbtafeffectuésdepuisle2018),
    nombrePIAFAttendus: Number(row.nbtafattendus)
  };
};

class SuiviParticipationAPI {
  constructor(credentials, sheetId, sheetTitle) {
    this.doc = new GoogleSpreadsheet(sheetId);
    this.credentials = credentials;
    this.sheetTitle = sheetTitle;
  }

  async getAll() {
    return await memoizedRows(
      this.doc,
      this.credentials,
      this.sheetTitle,
      rows =>
        rows.filter(row => row.mail.trim() !== "").map(formatParticipation)
    );
  }

  async getByEmail(email) {
    const all = await this.getAll();
    return all.find(one => one.email === email);
  }

  async getAllOk() {
    const all = await this.getAll();
    return all.filter(one => one.nombrePIAFOk);
  }

  async getAllNonOk() {
    const all = await this.getAll();
    return all.filter(one => !one.nombrePIAFOk);
  }
}

module.exports = SuiviParticipationAPI;
