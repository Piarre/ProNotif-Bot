import dayjs from "dayjs";
import { FilteredHomework, Homework } from "../typings/Pronote/Homework";
import { formatFrenchDate } from "./date";
import { MessagePayload, WebhookClient, WebhookMessageCreateOptions } from "discord.js";
import { New } from "../typings/Pronote/New";
import { Class } from "../typings/Pronote/Timetable";

const filterHomeworks = (homeworks: Homework[]): FilteredHomework[] => {
  const res = [];
  homeworks
    .reduce((result, todo) => {
      const existingDateItem = result.find((item) => item.date === todo.date);

      if (existingDateItem) {
        existingDateItem.todo.push({
          subject: todo.subject.name,
          description: todo.description,
          color: todo.background_color,
        });
      } else {
        result.push({
          date: todo.date,
          todo: [
            {
              subject: todo.subject.name,
              description: todo.description,
              color: todo.background_color,
            },
          ],
        });
      }

      return result;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((hw) => hw.date > dayjs().format("YYYY-MM-DD HH:mm") ?? res.push(hw));

  return res;
};

const formatHomeworks = (homeworks: FilteredHomework[]): string => {
  return homeworks.length < 0
    ? homeworks
        .map(
          (hw) =>
            `Pour le **${formatFrenchDate(hw.date.split(" ")[0])}**
              ${hw.todo.map((todo) => `- **${todo.subject}**\n\`${todo.description}\``).join("\n\n")}`
        )
        .join("\n\n\n")
    : "Aucun devoir pour cette semaine.";
};

const sendToWebhook = (url: string, options: string | MessagePayload | WebhookMessageCreateOptions): void => {
  const homeworksChannel = new WebhookClient({ url });

  homeworksChannel.send(options);
};

const findExtraNews = (arr1: New[], arr2: New[]): New[] => {
  const setArr2 = new Set(arr2.map((item) => item.title));

  const extraNews: New[] = arr1.filter((item) => !setArr2.has(item.title));

  return extraNews;
};

const hasCancelledChanged = (arr1: Class[], arr2: Class[]): boolean => {
  return arr1.some((item1) => {
    const item2 = arr2.find((item) => {
      const isSubjectMatch = item.subject.name === item1.subject.name;
      const areTeachersMatch = item.teachers.every((teacher) => item1.teachers.includes(teacher));
      const areRoomsMatch = item.rooms.every((room) => item1.rooms.includes(room));
      return isSubjectMatch && areTeachersMatch && areRoomsMatch;
    });

    return item2 && item1.is_cancelled !== item2.is_cancelled;
  });
};

export { sendToWebhook, filterHomeworks, formatHomeworks, findExtraNews, hasCancelledChanged };
