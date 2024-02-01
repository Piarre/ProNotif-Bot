import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../modules/Command";
import { Embed } from "../../modules/Embed";

export default new Command({
  name: "say",
  description: "Envoyer un message en tant qu'embed",
  cooldown: 5,
  ephemeral: true,
  usage: "/say <title> <message>",
  options: [
    {
      name: "titre",
      description: "Le titre de l'embed",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "message",
      description: "Le message de l'embed",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async ({ interaction, args }) => {
    const title = args.getString("titre");
    const message = args.getString("message");

    interaction.deleteReply();

    const em = new Embed(null, message, "Purple").setTitle(title).setFooter({
      text: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL(),
    });

    interaction.channel.send({
      embeds: [em],
    });
  },
  permissionsCheck: (interaction) => interaction.member.permissions.has("ManageChannels"),
});
