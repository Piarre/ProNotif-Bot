import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../modules/Command";
import { Embed } from "../../modules/Embed";

export default new Command({
  name: "clear",
  description: "Clear les messages",
  usage: "/clear <message>",
  options: [
    {
      name: "number",
      description: "Nombre de message à supprimer",
      required: true,
      type: ApplicationCommandOptionType.Integer,
      maxValue: 100,
      minValue: 1,
    },
  ],
  cooldown: 5,
  ephemeral: true,
  run: async ({ interaction, args }) => {
    const messageToDelete = args.getInteger("number");

    interaction.channel
      .bulkDelete(messageToDelete)
      .then(async (messages) =>
        interaction.followUp({
          embeds: [
            new Embed(
              "Clear",
              `${messages.size} ${messages.size == 1 ? "a été supprimé" : "ont été supprimés"} `,
              "Green"
            ),
          ],
        })
      )
      .catch();
  },
  permissionsCheck: (interaction) => interaction.member.permissions.has("ManageMessages"),
});
