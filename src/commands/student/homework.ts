import { Command } from "../../modules/Command";
import { Embed } from "../../modules/Embed";
import proLib from "../../modules/Pronote";
import { FilteredHomework, Homework } from "../../typings/Pronote/Homework";
import { filterHomeworks, formatHomeworks } from "../../utils/pronote";

export default new Command({
  name: "devoir",
  cooldown: 10,
  description: "Permet de voir les devoirs à faire.",
  ephemeral: false,
  usage: "/devoir",
  run: async ({ interaction }) => {
    await proLib.getToken();
    const homework: FilteredHomework[] = await proLib
      .homeworks()
      .then((res) => res.json())
      .then((res: Homework[]) => {
        return filterHomeworks(res);
      });

    return interaction.followUp({
      content: null,
      embeds: [
        new Embed("Devoir de la semaine", formatHomeworks(homework), "Green").setThumbnail(
         process.env.PRONOTE_SCHOOL_THUMBNAIL_URL
        ),
      ],
    });
  },
});
