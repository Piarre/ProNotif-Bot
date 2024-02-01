import {
  Collection,
  CommandInteractionOptionResolver,
} from "discord.js";
import { client } from "..";
import { Event } from "../modules/Event";
import { ProBotInteraction } from "../typings/Command";
import { Embed } from "../modules/Embed";

export default new Event("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  await interaction.deferReply({
    ephemeral: command.ephemeral ?? false,
    fetchReply: true,
  });

  if (!command)
    return interaction.followUp({
      embeds: [new Embed("Erreur", "Commande inconnue.", "Red")],
    });

  if (!command.permissionsCheck(interaction as ProBotInteraction))
    return interaction.followUp({
      embeds: [new Embed("Erreur", "Tu nas pas la permission d'utiliser cette commande.", "Red")],
    });

  // eslint-disable-next-line no-unused-expressions
  !client.cooldown.has(command.name) && client.cooldown.set(command.name, new Collection());

  const time = Date.now();
  const cooldown = client.cooldown.get(command.name);
  const timeCooldown: number = (command.cooldown || 5) * 1000;

  if (cooldown.has(interaction.member.user.id)) {
    const timeRestant = cooldown.get(interaction.member.user.id) + timeCooldown;

    if (time < timeRestant) {
      const timeLeft = timeRestant - time;

      const day = Math.round((timeLeft / (1000 * 60 * 60 * 24)) % 30);
      const hours = Math.round(timeLeft / (1000 * 60 * 60));
      const minutes = Math.round((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.round((timeLeft / 1000) % 60);

      return interaction.followUp({
        embeds: [
          new Embed(
            "Cooldown",
            `Vous pourrez utiliser la command **/${interaction.commandName}** dans ${day} ${hours} ${minutes} ${seconds}.`,
            "DarkGrey"
          ),
        ],
        ephemeral: true,
      });
    }
  }

  cooldown.set(interaction.member.user.id, time);
  setTimeout(() => cooldown.delete(interaction.member.user.id), timeCooldown);

  command.run({
    args: interaction.options as CommandInteractionOptionResolver,
    client,
    interaction: interaction as ProBotInteraction,
  });
});
