/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v2.0 | 2022-08-06
 */

"use strict";

const { MessageActionRow, MessageButton } = require('discord.js');
const { log } = require('./utils');

module.exports = {
	async deleteMsg(interaction) {
		const msg = interaction.message;
		if (msg.deletable) {
			const undoButt = new MessageButton()
				.setCustomId(`undoDeleteMsg${msg.id}`)
				.setLabel('Undo')
				.setStyle('PRIMARY');
			const undoRow = new MessageActionRow().addComponents(undoButt);
			msg.delete()
				.then(
					await interaction.reply({ content: 'Message deleted, undo?\n*(Undo button will expire in 1 minute)*', components: [undoRow], ephemeral: true })
						.then(() => {
							const filter = (i) => i.customId === `undoDeleteMsg${msg.id}` && i.user.id === interaction.user.id;
							msg.channel.awaitMessageComponent({ filter, time: 60000 })
								.then( () => {
									// If Undo button clicked, re-send the message that was deleted
									msg.channel.send({ content: msg.content, embeds: msg.embeds, components: msg.components, files: msg.attachments.toJSON() })
										.catch(err => log(`Error re-sending message in \`undoDeleteMsg\`, requested by ${interaction.user.tag}`, err));
									interaction.editReply({ content: 'Deletion undone.', components: [] })
										.catch(err => log(`Error editing Interaction reply (undo) from deleteMsg Button, requested by ${interaction.user.tag}`, err));
								// eslint-disable-next-line no-unused-vars
								}).catch(err => { // awaitMessageComponent received no Interactions before time ended
									// Edit the reply to indicate that the Undo button expired, and disable the button.
									undoButt.setDisabled(true);
									const undoRowExpired = new MessageActionRow().addComponents(undoButt);
									interaction.editReply({ content: 'Message deleted.\n*(Undo button expired)*', components: [undoRowExpired] })
										.catch(err => log(`Error editing Interaction reply (undo) from deleteMsg Button after Undo button expired.`, err));
								});
						})
				)
				.catch(err => log(`Error deleting message from deleteMsg Button, requested by ${interaction.user.tag}`, err));
		}
	}, // deleteMsg - end

	msgDeleteButton(text) {
		const button = new MessageButton()
			.setCustomId('deleteMsg')
			.setLabel(text)
			.setStyle('DANGER');
		return button;
	}, // msgDeleteButton - end
}; // module.exports - end