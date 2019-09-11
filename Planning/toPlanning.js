/**
 * TODO Adapter le code afin de fournir un format directement
 * proche du schéma GraphQL final afin de simplifier l'application
 */
const parse = require("date-fns/parse");

// see https://stackoverflow.com/a/20762713
const mostFrequentValueIn = values =>
  [...values]
    .filter(Boolean)
    .sort(
      (a, b) =>
        values.filter(v => v === a).length - values.filter(v => v === b).length
    )
    .pop();

const WorkDay = (label, tasks = []) => {
  return {
    label,
    tasks,
    addTask: task => WorkDay(label, [...tasks, task]),
    appendSlot: slot => {
      const latestTask = tasks.pop();
      return WorkDay(label, [...tasks, latestTask.addSlot(slot)]);
    },
    isOpened: () => tasks.some(task => task.isStaffed()),
    getDate: () => mostFrequentValueIn(tasks.map(task => task.getDate()))
  };
};
const Task = (label, slots = []) => {
  return {
    label,
    slots,
    addSlot: slot => Task(label, [...slots, slot]),
    isStaffed: () => slots.length > 0,
    getDate: () => mostFrequentValueIn(slots.map(slot => slot.date))
  };
};

const UnknownRow = () => {
  return {
    evolvePlanning: current => current
  };
};
const NewDayRow = data => {
  return {
    evolvePlanning: current => [...current, WorkDay(data[0])]
  };
};
const TaskNameRow = data => {
  const newTask = Task(data[0]);

  return {
    evolvePlanning: current => {
      if (current.length < 1) return current;
      const latestDay = current.pop();
      return [...current, latestDay.addTask(newTask)];
    }
  };
};
const SlotRow = data => {
  const dateFromFrenchFormat = source => {
    return parse(source, "dd/MM/yyyy", new Date());
  };
  const slot = {
    label: data[0],
    date: dateFromFrenchFormat(data[1]),
    hours: data[2],
    person: data[3] && {
      firstName: data[4],
      lastName: data[3],
      telephone: data[5],
      email: data[6]
    },
    notes: data[7]
  };

  return {
    evolvePlanning: current => {
      if (current.length < 1) return current;
      const latestDay = current.pop();
      return [...current, latestDay.appendSlot(slot)];
    }
  };
};

const makeDomainRow = row => {
  const cells = Object.values(row).map(cell => cell.toLowerCase().trim());

  if (cells[0].startsWith("semaine")) {
    return NewDayRow(row);
  }
  if (cells.filter(Boolean).length === 1) {
    return TaskNameRow(row);
  }

  const isDate = str => str.split("/").length === 3;
  if (isDate(cells[1])) {
    return SlotRow(row);
  }

  return UnknownRow(row);
};

const toPlanning = rows =>
  rows
    .map(makeDomainRow)
    .reduce((acc, row) => row.evolvePlanning(acc), [])
    .filter(day => day.isOpened());

module.exports = toPlanning;
