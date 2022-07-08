/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.0 | 2021-11-23
 */

"use strict";

// If you don't want to require @discordjs/builders, you can replace below "${time(message.createdAt)}" with another way to display the Date, like toLocaleString
const { time } = require('@discordjs/builders');
const { MessageEmbed, Message, User, MessageReaction, MessageActionRow } = require('discord.js');
const { msgDeleteButton } = require('../src/delete-button');
const { incrementBookmarks } = require('../db/database-access');

module.exports = {
	data: {
		"name": "Bookmark",
		"type": 3, // Type 3 indicates that this is a Context Menu Application Command, so that it'll be deployed as such.
        /**
         * SlashCommands built with Discord's SlashCommandBuilder class have this automatically, but to make a command from just an Object like this
         *      you have to provide the toJSON() function. It's necessary even if it just returns 'this'.
         *
         * @returns this JSON Object
         */
		toJSON() {
			return this;
		},
	},
	async execute(interaction) {
		try {
			const user = interaction.user;
			let message;
			if (interaction.reaction instanceof MessageReaction) { // interaction is a message
				message = interaction.reaction.message;
			}
			else if (interaction.targetType === "MESSAGE") { // interaction is a Command Interaction
				// Gets the Message object from the channel's cache.
				message = interaction.channel.messages.cache.get(interaction.targetId);
				// Defer the reply in case the message is big and takes a while to send
				await interaction.deferReply({ ephemeral: true });
			}

			if (message.partial) { // if partial, fetch full message first
				try { await message.fetch(); }
				catch (error) { console.error('Something went wrong when fetching the message in `bookmark`', error); }
			}

			if (!(user instanceof User && message instanceof Message)) { // if arguments are not at all what they're supposed to be,
				throw new TypeError('Provided argument is not of a valid type.');
			}

			// Create an Embed to sent to the user which contains the content of the bookmarked message.
			const msgEmbed = new MessageEmbed()
				.setColor('#DB2E43') // A nice red that matches the bookmark emoji.
				.setThumbnail(user.client.user.displayAvatarURL({ dynamic: true, size: 96 })) // bot's profile picture (which is the bookmark emoji) ar thumbnail.
				.setTitle(`Message bookmarked from *${message.guild.name}* :`)
				.setURL(message.url) // The title of the embed links to the original message, as long as it still exists.
				.setDescription(message.content)
				// .setFooter(`Sent by user ${message.author.tag}`)
				.setAuthor(`${message.author.tag} | #${message.channel.name}`, message.author.displayAvatarURL({ dynamic: true, size: 64 })); // Embed author is original author and the channel it was posted to

			// For each of the embeds in the original message, create a Field in our Bookmark Embed with the content and info of the original embed.
			message.embeds.forEach(embed => {
				msgEmbed.addField(embed.title ? embed.title : `Bookmarked message embed: ${embed.url ? embed.url : ""}`, `${embed.description ? embed.description : "`No embed content`"}\n${embed.author ? `\n*EmbedAuthor:* ${embed.author.name}` : " "}${embed.footer ? `\n*Footer:* ${embed.footer.text}` : " "}`, false);
					// If the original embed also has Fields, just add them as additional Fields to our Bookmark Embed
				embed.fields.forEach(field => {
					msgEmbed.addField(field.name ? field.name : "*Embed's field*:", field.value ? field.value : "`No value for this field`", true);
				});// fields forEach - end
			});// embeds forEach - end

			/**
			 * Send the Bookmark to the user's Direct Messages, including the date at which it was bookmarked and the embed with the messages content.
			 * If the function was called from a MessageReaction, send it to the user's DM's.
			 * Also add a Delete button to delete the bookmark.
			 */
			const deleteButtRow = new MessageActionRow().addComponents(msgDeleteButton('Delete Bookmark'));
			user.send({ content: `Original message was sent on ${time(message.createdAt)}`, embeds: [msgEmbed], components: [deleteButtRow], files: message.attachments.toJSON() })
				.catch(err => console.log(`Error caught sending embed of a Bookmarked message in \`${this.data.name}#execute\`\n\t${err}`));
			if (interaction.targetType === "MESSAGE") { // interaction is a Command Interaction
				// Send an ephemeral reply to the channel to tell the user that the bookmark was successful.
				await interaction.editReply({ content: `OK, the message has been sent to your DM's!`, ephemeral: true });
			}

			console.log(`${new Date().toLocaleString('en-US', { timeZone: 'America/Winnipeg', timeZoneName: 'short' })} - Bookmark created by ${user.tag} in server ${interaction.server.name}`);
			incrementBookmarks(user.client.user.id, interaction.guild.id, user.id);
		}
		catch (error) {
			console.error(error);
			console.log(`Error executing \`${this.data.name}\` command`);
		}
	},
};
