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
