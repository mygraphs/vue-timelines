import dayjs from "dayjs";

export const getDiffDays = (firstDate, secondDate) => {
  let diff = Math.abs((secondDate - firstDate) / (24 * 60 * 60));
  return diff;
};

export const addDays = (timestamp, days) => {
  return (timestamp + days * 24 * 60 * 60) | 0;
};

export const subtractDays = (timestamp, days) => {
  return (timestamp - days * 24 * 60 * 60) | 0;
};

export const initDay = (timestamp) => {
  return dayjs(timestamp * 1000)
    .startOf("day")
    .unix();
};

export const firstDayMonth = (timestamp) => {
  return dayjs(timestamp * 1000)
    .startOf("month")
    .unix();
};

export const lastDayMonth = (timestamp) => {
  return dayjs(timestamp * 1000)
    .endOf("month")
    .unix();
};

export const convertToDay = (timestamp) => {
  return dayjs(timestamp * 1000)
};

export const getWeekNumber = (d) => {
  /* For a given date, get the ISO week number
   *
   * Based on information at:
   * Algorithm is to find nearest thursday, it's year
   * is the year of the week number. Then get weeks
   * between that date and the first day of that year.
   *
   * Note that dates in one year can be weeks of previous
   * or next year, overlap is up to 3 days.
   *
   * e.g. 2014/12/29 is Monday in week  1 of 2015
   *      2012/1/1   is Sunday in week 52 of 2011
   */
  // Copy date so don't modify original

  d = new Date(d);  // We get a dayjs
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return weekNo;
}

