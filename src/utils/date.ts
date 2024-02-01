import dayjs from "dayjs";
import "dayjs/locale/fr";

const getWeek = () => {
  const currentDate = dayjs();
  const day = currentDate.day();

  const monday = currentDate.subtract(day === 0 ? 6 : day - 1, "day");
  const sunday = monday.add(6, "day");

  if (day === 6 || day === 0) {
    const nextMonday = monday.add(7, "day");
    const nextSunday = nextMonday.add(6, "day");
    return { monday: nextMonday.format("YYYY-M-D"), sunday: nextSunday.format("YYYY-M-D") };
  }

  return { monday: monday.format("YYYY-M-D"), sunday: sunday.format("YYYY-M-D") };
};

const getDay = () => {
  const currentDate = dayjs();

  if (currentDate.day() == 5) {
    return currentDate.add(3, "day").format("YYYY-M-D");
  } else if (currentDate.day() == 6) {
    return currentDate.add(2, "day").format("YYYY-M-D");
  } else if (currentDate.day() == 0) {
    return currentDate.add(1, "day").format("YYYY-M-D");
  }

  return currentDate.format("YYYY-M-D");
};

const formatFrenchDate = (dateString) => {
  dayjs.locale("fr");
  const formattedDate = dayjs(dateString).format("dddd D MMMM YYYY");
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

export { getWeek, getDay, formatFrenchDate };
