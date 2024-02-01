/* eslint-disable no-unused-vars */
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    ChatInputApplicationCommandData,
    GuildMember
} from 'discord.js';
import { ProBotClient } from '../modules/Client';

export interface ProBotInteraction extends CommandInteraction {
    member: GuildMember;
}

interface RunOptions {
    client: ProBotClient;
    interaction: ProBotInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => Promise<any>;

export type CommandType = {
    permissionsCheck?: (interaction: ProBotInteraction) => boolean;
    ephemeral: boolean;
    cooldown: number;
    run: RunFunction;
    usage: string;
} & ChatInputApplicationCommandData;