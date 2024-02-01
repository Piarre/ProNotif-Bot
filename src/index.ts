import { config } from "dotenv";
import { resolve } from "path";
import { ProBotClient } from "./modules/Client";
import { CronJob } from "cron";
import { FilteredHomework, Homework } from "./typings/Pronote/Homework";
import { Embed } from "./modules/Embed";
import proLib from "./modules/Pronote";
import { filterHomeworks, formatHomeworks, sendToWebhook } from "./utils/pronote";

config({ path: resolve(process.cwd(), ".env") });

export const client = new ProBotClient();

process.on("unhandledRejection", (reason: { code: number; stack: string; message: string }) => {
  switch (reason.code) {
    case 10062:
      console.error("Error", "Unknown interaction", reason);
      break;
    case 10008:
      console.error("Error", "Unknown message", reason);
      break;
    case 50013:
      console.error("Error", "Missing permissions", reason);
      break;
    default:
      console.error(reason);
      break;
  }
});

process.on("uncaughtException", (err) => {
  if (err) throw new Error(err.stack);
});

client.start();

new CronJob("0 17 * * *", async () => {
  await proLib.getToken();
  const homework: FilteredHomework[] = await proLib
    .homeworks()
    .then((res) => res.json())
    .then((res: Homework[]) => {
      return filterHomeworks(res);
    });

  const res = new Embed("Devoir de la semaine", formatHomeworks(homework), "Green")
    .setThumbnail(process.env.PRONOTE_SCHOOL_THUMBNAIL_URL)
    .toJSON();

  sendToWebhook(process.env.CHANNEL_WEBHOOK_URL_HOMEWORKS, {
    content: null,
    embeds: [res],
  });
}).start();
