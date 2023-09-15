export function getMonthsBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  const months = (endYear - startYear) * 12 + (endMonth - startMonth);

  return months;
}

export const getDaysBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

  return days;
}