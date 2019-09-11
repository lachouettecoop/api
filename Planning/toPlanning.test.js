const parse = require("date-fns/parse");
const SUT = require("./toPlanning");

const notMeaningfulRow = ["I Have some text", "and other things"];

const newDayRow = ["Semaine A - MERCREDI 24 AVRIL", "", "", "", "", "", "", ""];
const dayHeadingRow = [
  "TAF",
  "Date",
  "Horaire",
  "Nom",
  "Prénom",
  "Téléphone",
  "Email",
  "Remarques"
];
const taskNameRow = ["Réception et mise en rayon", "", "", "", "", "", "", ""];
const slotRow = [
  "Grand Hibou",
  "24/04/2019",
  "9h-12h",
  "DOE",
  "John",
  "06 01 02 03 04",
  "john@example.com"
];

const validDayPlanning = [
  newDayRow,
  dayHeadingRow,
  taskNameRow,
  slotRow,
  slotRow,
  slotRow,
  slotRow,
  taskNameRow,
  slotRow,
  slotRow,
  slotRow
];

describe("toPlanning", () => {
  it("should return an empty planning when no rows", () => {
    expect(SUT([])).toEqual([]);
  });

  it("should return an empty planning when no meaningful rows", () => {
    const noMeaningFulRows = [
      notMeaningfulRow,
      notMeaningfulRow,
      notMeaningfulRow,
      notMeaningfulRow
    ];
    expect(SUT(noMeaningFulRows)).toEqual([]);
  });

  it("should return an array with the correct number of days", () => {
    const fiveDaysPlanning = [
      notMeaningfulRow,
      ...validDayPlanning,
      notMeaningfulRow,
      ...validDayPlanning,
      notMeaningfulRow,
      ...validDayPlanning,
      ...validDayPlanning,
      notMeaningfulRow,
      ...validDayPlanning
    ];
    expect(SUT(fiveDaysPlanning)).toHaveLength(5);
  });

  it("should not return days without tasks", () => {
    const planning = [
      notMeaningfulRow,
      newDayRow,
      dayHeadingRow,

      notMeaningfulRow,
      newDayRow,
      dayHeadingRow,
      taskNameRow,
      slotRow,

      ...validDayPlanning
    ];
    expect(SUT(planning)).toHaveLength(2);
  });

  it("should not return days with tasks without slots", () => {
    const planning = [
      notMeaningfulRow,
      newDayRow,
      dayHeadingRow,
      taskNameRow,

      ...validDayPlanning
    ];
    expect(SUT(planning)).toHaveLength(1);
  });

  it("should return the correct number of tasks for each day", () => {
    const planning = [
      ...validDayPlanning,
      ...validDayPlanning,
      taskNameRow,
      slotRow
    ];

    const actualTasksPerDay = SUT(planning).map(day => day.tasks.length);
    expect(actualTasksPerDay).toEqual([2, 3]);
  });

  it("should return the correct number of slots for each task", () => {
    const planning = [...validDayPlanning];

    const actualDays = SUT(planning);
    const actualSlotsPerTasksOfFirstDay = actualDays[0].tasks.map(
      task => task.slots.length
    );
    expect(actualSlotsPerTasksOfFirstDay).toEqual([4, 3]);
  });

  it("should return the date from the majority of slots", () => {
    const slotWithDate = date => {
      let slot = [...slotRow];
      slot[1] = date;
      return slot;
    };

    const planning = [
      newDayRow,
      dayHeadingRow,
      taskNameRow,
      slotWithDate("01/07/2019"),
      slotWithDate("01/06/2019"),
      slotWithDate("01/06/2019")
    ];

    const actualDate = SUT(planning)[0].getDate();
    expect(actualDate).toEqual(parse("2019-06-01", "yyyy-MM-dd", new Date()));
  });
});
