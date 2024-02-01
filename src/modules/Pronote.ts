/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { WebhookClient } from "discord.js";
import { New } from "../typings/Pronote/New";
import { Response } from "../typings/Pronote/Response";
import { formatFrenchDate, getWeek } from "../utils/date";
import { Embed } from "./Embed";
import { Class } from "../typings/Pronote/Timetable";

export class Pronote {
  private TOKEN: string;

  async getToken() {
    const form = new FormData();

    form.append("url", process.env.PRONOTE_URL);
    form.append("username", process.env.PRONOTE_USERNAME);
    form.append("password", process.env.PRONOTE_PASSWORD);

    return await this.call(`/generatetoken?version=3.11.2`, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data: Response) => {
        this.TOKEN = data.token;
      });
  }

  async call(url: string, options?: RequestInit) {
    return await fetch(`${process.env.PRONOTE_API_URL}${url}`, options);
  }

  async homeworks() {
    return await this.call(`/homework?token=${this.TOKEN}&dateFrom=${getWeek().monday}&dateTo=${getWeek().sunday}`);
  }

  async news() {
    return await this.call(`/news?token=${this.TOKEN}`);
  }

  reduceNews(news: New[]) {
    return news.map((currentNew: New & { html_content; read; survey; anonymous_survey }) => {
      const { html_content, read, survey, anonymous_survey, ...newWithoutHtmlContent } = currentNew;
      return newWithoutHtmlContent;
    });
  }

  reduceTimetable(timetable: Class[]) {
    return timetable.map((currentTimetable: Class) => {
      const { virtual, content, memo, ...timetableWithoutHtmlContent } = currentTimetable;
      return timetableWithoutHtmlContent;
    });
  }

  sendNew(_new: New) {
    const newsChannel = new WebhookClient({
      url: process.env.CHANNEL_WEBHOOK_URL_NEWS,
    });

    const embed = new Embed(null, _new.content, "DarkGreen")
      .setTitle(_new.title)
      .setFooter({
        text: `${_new.author}`,
      })
      .setTimestamp(new Date(_new.date))
      .toJSON();

    newsChannel.send({
      content: null,
      embeds: [embed],
      files:
        Array.isArray(_new.attachments) && _new.attachments.length > 0
          ? _new.attachments.map((attachment) => {
              return {
                name: attachment.name,
                attachment: attachment.url,
              };
            })
          : [],
    });
  }

  sendTimeTable(_class: Class[]) {
    const tes = new WebhookClient({
      url: process.env.CHANNEL_WEBHOOK_URL_TIMETABLE,
    });

    const embed = new Embed(
      null,
      `
    ${_class
      .sort((a, b) => {
        const dateA = new Date(a.start).getTime();
        const dateB = new Date(b.start).getTime();

        return dateA - dateB;
      })
      .map((cls) =>
        cls.is_cancelled
          ? `
- **ANNULÉ** ~~${cls.subject.name}** de **${cls.start.split(" ")[1]}** à **${cls.end.split(" ")[1]}~~ **ANNULÉ**
  - ~~${cls.teachers.length == 1 ? "Professeur :" : "Professeurs :"} ${cls.teachers.join(" | ") + "~~"}
  - ~~${cls.rooms.length == 1 ? "Salle :" : "Salles :"}  ${cls.rooms.join(", ") + "~~"}
        `
          : `
- **${cls.subject.name}** de **${cls.start.split(" ")[1]}** à **${cls.end.split(" ")[1]}**
  - ${cls.teachers.length == 1 ? "Professeur :" : "Professeurs :"} ${cls.teachers.join(" | ")}
  - ${cls.rooms.length == 1 ? "Salle :" : "Salles :"}  ${cls.rooms.join(", ")}
          `
      )
      .join("\n\n")}
    `,
      "DarkGreen"
    )
      .setTitle(`Emploie du temps **${formatFrenchDate(_class[0].start.split(" ")[0])}**`)
      // .setFooter({
      //   text: `${_new.author}`,
      // })
      .toJSON();

    tes.send({
      content: null,
      embeds: [embed],
    });
  }

  async getTimetable(date: string | Date) {
    return await this.call(`/timetable?token=${this.TOKEN}&dateString=${date}`);
  }
}

const proLib = new Pronote();

export default proLib;
