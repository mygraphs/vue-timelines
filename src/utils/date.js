import dayjs from "dayjs";

export const getDiffDays = (firstDate, secondDate) => {
  return Math.abs(dayjs(firstDate * 1000).diff(secondDate * 1000, "d"));
};

export const addDays = (timestamp, days) => {
  return dayjs(timestamp * 1000)
    .add(days, "day")
    .unix();
};

export const subtractDays = (timestamp, days) => {
  return dayjs(timestamp * 1000)
    .subtract(days, "day")
    .unix();
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
