/* eslint-disable no-magic-numbers */

/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v2.0 | 2022-07-08
 */

"use strict";

// Imports
const fs = require('fs');
const db = require('./db/database-access');
const { Client, Collection, Intents } = require('discord.js'); // Import the discord.js module.
const { deleteMsg } = require('./src/delete-button');
const { dateString } = require('./src/utils');

// Array with bot's needed Intents
const BOT_INTENTS = [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.DIRECT_MESSAGES,
];
const BOT_PARTIALS = [
	'MESSAGE',
	'CHANNEL',
	'REACTION',
];


// Create an instance of a Discord client
const client = new Client({ intents: BOT_INTENTS, partials: BOT_PARTIALS });
// Create Commands Collection
client.commands = new Collection();

// // Global commands
// const cmdFiles = fs.readdirSync('./global_commands').filter(file => file.endsWith('.js'));
// // Set into Collection
// for (const file of cmdFiles) {
// 	const command = require(`./global_commands/${file}`);
// 	try { client.commands.set(command.data.name, command); }
// 	catch (error) { console.error(`${dateString()} - Error pushing ${file}`, error); }
// }// Set global commands into Collection - end

// Guild commands
const guildCmdFiles = fs.readdirSync('./guild_commands').filter(file => file.endsWith('.js'));
// Set into Collection
for (const file of guildCmdFiles) {
	const command = require(`./guild_commands/${file}`);
	try { client.commands.set(command.data.name, command); }
	catch (error) { console.error(`${dateString()} - Error pushing ${file}`, error); }
}// Set guild commands into Collection - end


// Log in with Bot's Token
client.login(process.env.BOT_TOKEN_BOTMARK);

// ----------------- DISCORD EVENTS -----------------------------------------------------------------------------------------------------------

// On log in
client.on('ready', async () => {
	process.send('ready');
	console.log(`\n\nLogged in as ${client.user.tag}! \nOn ${dateString()}\n`);
	client.user.setPresence({
		status: 'online',
		activities: [{
			name: 'out for bookmarks', // `out for bookmarks in ${GUILD_LIST.length} servers`
			type: 'WATCHING',
		}]
	});
        // console.log(client.user.presence);
	console.log(
		`ClientPresence {
			status: ${client.user.presence.status}
			activity: {
				name: '${client.user.presence.activities[0].name}'
				type: '${client.user.presence.activities[0].type}'
			}
		}`
	);

    // Check that the database's server list is up to date with the guilds the bot is in, in case it joined while offline.
	const guildList = await db.getServerList();
	client.guilds.cache.forEach(async (guild, guildId) => {
		if (!guildList || guildList.find(g => g.serverid === guildId) === undefined) {
			try {
				const inserted = await db.insertServer(guildId, guild.name);
				if (inserted) {
					deployCommands();
				}
			}
			catch (error) {
				console.error(`${dateString()} - Error inserting server into db during login check.`, error);
			}
		}
	});// guilds cache forEach - end
}); // on ready - end

// Interaction occurs
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand() || interaction.targetType === "MESSAGE") {
		const command = client.commands.get(interaction.commandName);
		if (command) {// if command not null
			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(`${dateString()} - Error executing Application command '${interaction.commandName}' requested by user: ${interaction.user.tag}, in server: ${interaction.guild.name}`, error);
				await interaction.reply({ content: '```fix\nThere was an error while executing this command!\nPlease try again later.\n```', ephemeral: true })
					.catch(err => console.error(`${dateString()} - Error replying to Application Command interaction with error message`, err));
			}
		}
		else // if command null
			console.log(`${dateString()} - Command not found corresponding to \`${interaction.commandName}\``);
	}// if MessageCommand - end
	else if (interaction.isButton()) {
		if (interaction.customId === 'deleteMsg') {
			deleteMsg(interaction);
		} // deleteMsg button - end
	}// if ButtonCommand - end
}); // on interactionCreate - end

// User reacts to a message
client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.partial) {// if reaction is partial, fetch it first!
		try {
			await reaction.fetch();
		}
		catch (error) {
			console.error(`${dateString()} - Something went wrong when fetching the PartialMessageReaction`, error);
			return;
		}
	}// partial - end

	if (!reaction.partial && reaction.message.guild && !user.bot) { // Only by human users, only in servers
        // if the reaction is a :bookmark: or a :bookmark_tabs: emoji (respectively), execute the bookmark command
		if (reaction.emoji.identifier === "%F0%9F%94%96" || reaction.emoji.identifier === "%F0%9F%93%91") {
			try {
				// console.log(`${dateString()} - Bookmark requested by user ${user.tag}`);
				require('./guild_commands/bookmark').execute({ reaction: reaction, user: user });
			}
			catch (error) {
				console.error(`${dateString()} - Error executing Application command 'bookmark' requested by user: ${user.tag}, in server: ${reaction.message.guild.name}`, error);
				user.send('```diff\n- There was an error while executing bookmark command from emoji reaction!\n- Please try again later.\n```')
					.catch(err => console.error(`${dateString()} - Error notifying user that reaction bookmark was unsuccessful`, err));
			}
		} // if bookmark emojis - end
	} // if in guild and not bot - end
}); // on messageReactionAdd - end

// Bot joins a new guild (server)
client.on('guildCreate', async guild => {
	try {
		console.log(`${dateString()} - Joined server: ${guild.name}`);
		const guildList = await db.getServerList();
		if (!guildList || guildList.find(g => g.serverid === guild.id)) {
			await db.insertServer(guild.id, guild.name);
			deployCommands();
		}
	}
	catch (error) {
		console.error(dateString() + ' - Error adding server to database after joining guild.', error);
	}
}); // on guildCreate - end

// Bot leaves a guild (server)
client.on('guildDelete', async guild => {
	try {
		const guildList = await db.getServerList();
		if (!guildList || guildList.find(g => g.serverid === guild.id)) {
			await db.removeServer(guild.id);
		}
		console.log(`${dateString()} - Left server: ${guild.name}`);
	}
	catch (error) {
		console.error(dateString() + ' - Error removing server from database after leaving guild.', error);
	}
}); // on guildCreate - end

// On error
client.once('error', error => console.error(`${dateString()} - Client ran into an error!`, error));


// ----------------- SIGNALS -----------------------------------------------------------------------------------------------------------

// Signal handling for termination requests
process.once('SIGINT', () => { logout(); });
process.once('SIGTERM', () => { logout(); });
function logout() {
	console.log(`${dateString()} - Client logging out and self-destructing...`);
	client.destroy();
}// logout - end


// ----------------- FUNCTIONS -----------------------------------------------------------------------------------------------------------

// run the deplot-commands.js file, for when joining a new server
function deployCommands() {
	try {
		console.log(`${dateString()} - Running deploy-commands.js file...`);
		require('child_process').fork('./deploy-commands.js', { stdio: 'inherit' });
	}
	catch (error) {
		console.error(`\n${dateString()} - Error forking deployCommands()`, error);
	}
}// deployCommands - end

// ---------------- EXPORTS --------------------------------------------------------------------------------------------------------------

module.exports = {
	// Rebooting the bot after child process is done deploying commands
	reboot() {
		console.log(`\n${dateString()} - Rebooting '${process.env.PROCESS_ID}' process...`);

		// pm2 restart app
		setTimeout(() => {
			const pm2 = require('pm2');// Import module for pm2
			pm2.connect((err) => {
				if (err) {
					console.error(`\n${dateString()} - Something went wrong when connecting to pm2 process.`, err);
					process.exit(2);
				}

				pm2.restart(process.env.PROCESS_ID, (err) => {
					pm2.disconnect();
					if (err) {
						console.error(`\n${dateString()} - Something went wrong when restarting and disconnecting from pm2 process.`, err);
						throw err;
					}
				});
			});
		}, 1000);
	}
};