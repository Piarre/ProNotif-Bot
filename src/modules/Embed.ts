import { EmbedBuilder } from "discord.js";
import { DJSColorPalette, DiscordColorPalette } from "../typings/Color";
import { client } from "..";

/**
 * @class Embed
 * @constructor client, message, color
 * @param { ProBotClient } client
 * @param { string } message
 * @param { keyof typeof DJSColorPalette | keyof typeof DiscordColorPalette } color
 * @example
 * import Embed from './src/modules/Embed.ts';
 *
 * const embed = new Embed("Title", "Hey from Discord Embed", "Red");
 *
 * interaction.followUp({
 *     content: null,
 *     embeds: [embed]
 * });
 */
export class Embed extends EmbedBuilder {
    constructor(
        title: string,
        message: string,
        color: keyof typeof DJSColorPalette | keyof typeof DiscordColorPalette,
    ) {
        super({
            title: `Pronote - ${title}`,
            description: message,
            footer: {
                text: client.user.tag,
                iconURL: client.user.displayAvatarURL(),
            },
            timestamp: new Date(),
            color: DJSColorPalette[color],
        });
    }
}
