import {
  Client,
  Collection,
  ApplicationCommandDataResolvable,
  ClientEvents,
  Partials,
  Guild,
  ClientApplication,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { CommandType } from "../typings/Command";
import { promisify } from "util";
import { RegisterCommandsOptions, UnRegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";
import path from "path";
import glob from "glob";

const globPromise = promisify(glob);
export const row = new ActionRowBuilder<StringSelectMenuBuilder>();

export class ProBotClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  cooldown: Collection<string, any> = new Collection();

  constructor() {
    super({
      intents: [
        "DirectMessages",
        "GuildMessages",
        "GuildMembers",
        "GuildModeration",
        "MessageContent",
        "GuildIntegrations",
        "Guilds",
      ],
      partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.Reaction],
    });
  }

  async start(): Promise<void> {
    await this.registerModules();

    await this.login(process.env.TOKEN);
  }

  async importFile(filePath: string): Promise<any | any[]> {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions): Promise<void> {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
    } else {
      this.application?.commands.set(commands);

      console.info("Info", "Registering global commands");
    }
  }

  async unregisterCommands({ guildId }: UnRegisterCommandsOptions): Promise<void> {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set([]);
    } else {
      const app = this.application as ClientApplication;

      app.commands.set([]);
    }
  }

  async registerModules(): Promise<void> {
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(path.join(__dirname, `../commands/*/*{.ts,.js}`));

    const select = new StringSelectMenuBuilder()
      .setCustomId("help")
      .setPlaceholder("Select a command");

    commandFiles.forEach(async (filePath: string) => {
      const command: CommandType = await this.importFile(filePath);

      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);

      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(command.usage.split(" ")[0].slice(1).trim())
          .setDescription(command.usage)
          .setValue(command.usage.split(" ")[0].slice(1).trim())
      );
    });

    row.addComponents(select);

    this.on("ready", () => {
      this.guilds.cache.forEach((guild) => {
        const guildBot = this.guilds.cache.get(guild.id) as Guild;

        if (guildBot.commands.cache.size < 1) {
          this.registerCommands({
            commands: slashCommands,
            guildId: guild.id,
          });
        } else {
          const commandMap =
            guildBot.commands.cache.map((command) => command) ??
            this.application?.commands.cache.map((command) => command);

          const find = commandMap.filter((item, index) => commandMap.indexOf(item) !== index);

          if (find.length > 0) return this.unregisterCommands({ guildId: guild.id });
        }
      });
    });

    const eventFiles = await globPromise(path.join(__dirname, `../events/*{.ts,.js}`));

    eventFiles.forEach(async (filePath: string) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);

      this.on(event.event, event.run);
    });
  }
}
