import { Event } from "../modules/Event";
import proLib from "../modules/Pronote";
import { existsSync, mkdir, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { New } from "../typings/Pronote/New";
import { getDay } from "../utils/date";
import { Class } from "../typings/Pronote/Timetable";
import { findExtraNews, hasCancelledChanged } from "../utils/pronote";

const NEWS_FILE_PATH = join(process.cwd(), "pronote", "news.json");
const TIMETABLE_FILE_PATH = join(process.cwd(), "pronote", "timetable.json");

export default new Event("ready", async (client) => {
  console.log(`> ${client.user.username} started successfuly!`);

  if (!existsSync(join(process.cwd(), "pronote")))
    mkdir(join(process.cwd(), "pronote"), () => {
      console.log("> Pronote folder created!");
    });

  await proLib.getToken();

  const fetchedInitialNews: any[] = await proLib
    .news()
    .then((res) => res.json())
    .then((data) => data as New[]);

  writeFileSync(NEWS_FILE_PATH, JSON.stringify(proLib.reduceNews(fetchedInitialNews), null, 2), {
    encoding: "utf-8",
    flag: "w",
  });

  const fetchedInitialTimetable: any[] = await proLib
    .getTimetable(getDay())
    .then((res) => res.json())
    .then((data) => data as Class[]);

  writeFileSync(TIMETABLE_FILE_PATH, JSON.stringify(proLib.reduceTimetable(fetchedInitialTimetable), null, 2), {
    encoding: "utf-8",
    flag: "w",
  });

  setInterval(async () => {
    await proLib.getToken();
    try {
      const response = await proLib.news();
      const fetchedNews = proLib.reduceNews((await response.json()) as New[]);
      const localNews = JSON.parse(readFileSync(NEWS_FILE_PATH) as any) as New[];

      findExtraNews(fetchedNews, localNews).forEach((newElement) => {
        const reducedNew = proLib.reduceNews([newElement])[0];
        proLib.sendNew(reducedNew);
        localNews.push(reducedNew);
      });

      writeFileSync(NEWS_FILE_PATH, JSON.stringify(localNews, null, 2), {
        encoding: "utf-8",
        flag: "w",
      });
    } catch (error) {
      console.error("Error while updating news:", error);
    }

    try {
      const response = await proLib.getTimetable(getDay());
      const fetchedNews = (await response.json()) as Class[];
      const localClasses = JSON.parse(readFileSync(TIMETABLE_FILE_PATH) as any) as Class[];

      if (hasCancelledChanged(fetchedNews, localClasses)) {
        proLib.sendTimeTable(localClasses);
      }

      writeFileSync(TIMETABLE_FILE_PATH, JSON.stringify(fetchedNews, null, 2), {
        encoding: "utf-8",
        flag: "w",
      });
    } catch (error) {
      console.error("Error while updating timetable:", error);
    }
  }, 15 * 60 * 1000);
});

