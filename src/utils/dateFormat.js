export const dateFormat = (timestamp) => {
  const locale = window.navigator.language;
  const formatToParts = { month: "2-digit", day: "2-digit", year: "numeric" };

  return new Intl.DateTimeFormat(locale, formatToParts).format(
    new Date(timestamp / 1000)
  );
};
