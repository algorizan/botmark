/* eslint-disable no-magic-numbers */

/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.0 | 2021-11-23
 */

"use strict";

// Imports
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');// Import the discord.js module.
const { BOT_TOKEN, PROCESS_ID } = require('./client-codes.json');// Import JSON with login token.
const { deleteMsg } = require('./delete-button');

// Array with Ladon's needed Intents
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

// Global commands
const cmdFiles = fs.readdirSync('./global_commands').filter(file => file.endsWith('.js'));
// Set into Collection
for (const file of cmdFiles) {
	const command = require(`./global_commands/${file}`);
	try { client.commands.set(command.data.name, command); }
	catch (error) { console.error(`Error pushing ${file}\n\t${error}`); }
}// Set global commands into Collection - end

// Guild commands
const guildCmdFiles = fs.readdirSync('./guild_commands').filter(file => file.endsWith('.js'));
// Set into Collection
for (const file of guildCmdFiles) {
	const command = require(`./guild_commands/${file}`);
	try { client.commands.set(command.data.name, command); }
	catch (error) { console.error(`Error pushing ${file}\n\t${error}`); }
}// Set guild commands into Collection - end


// Log in with Bot's Token
client.login(BOT_TOKEN);

// ----------------- DISCORD EVENTS -----------------------------------------------------------------------------------------------------------

// On log in
client.on('ready', () => {
	process.send('ready');
	console.log(`\n\nLogged in as ${client.user.tag}! \nOn ${new Date().toLocaleString('en-US', { timeZone: 'America/Winnipeg', timeZoneName: 'short' })}\n`);
	client.user.setPresence({
		status: 'online',
		activities: [{
			name: 'out for bookmarks', // `out for bookmarks in ${require('./config.json').GUILD_LIST.length} servers`
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
}`);

    // Check that the config file's guild list is up to date with the guilds the bot is in, in case it joined while offline.
	let joined = false;
	const config = JSON.parse(fs.readFileSync('./config.json', 'utf8')); // read in config file
	client.guilds.cache.forEach((guild, guildId) => {
		if (config.GUILD_LIST.find(g => g.id === guildId) === undefined) {
			config.GUILD_LIST.push({ id: guildId, name: guild.name });
			fs.writeFileSync('./config.json', JSON.stringify(config, null, 4), 'utf8');
			joined = true;
		}
	});// guilds cache forEach - end
	if (joined) {
		deployCommands();
	}
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
				console.log(`Error executing Application command '${interaction.commandName}' requested by user: ${interaction.user.tag}, in server: ${interaction.guild.name}\n\t${error}`);
				await interaction.reply({ content: '```fix\nThere was an error while executing this command!\nPlease try again later.\n```', ephemeral: true })
					.catch(err => console.log(`Error replying to Application Command interaction with error message\n\t${err}`));
			}
		}
		else // if command null
			console.log(`Command not found corresponding to \`${interaction.commandName}\``);
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
			console.error('Something went wrong when fetching the PartialMessageReaction', error);
			return;
		}
	}// partial - end

	if (!reaction.partial && reaction.message.guild && !user.bot) { // Only by human users, only in servers
        // if the reaction is a :bookmark: or a :bookmark_tabs: emoji (respectively), execute the bookmark command
		if (reaction.emoji.identifier === "%F0%9F%94%96" || reaction.emoji.identifier === "%F0%9F%93%91") {
			try {
				// console.log(`Bookmark requested by user ${user.tag}`);
				require('./guild_commands/bookmark').execute({ reaction: reaction, user: user });
			}
			catch (error) {
				console.error(error);
				console.log(`Error executing Application command 'bookmark' requested by user: ${user.tag}, in server: ${reaction.message.guild.name}`);
				user.send('```diff\n- There was an error while executing bookmark command from emoji reaction!\n- Please try again later.\n```')
					.catch(err => console.log(`Error notifying user that reaction bookmark was unsuccessful\n\t${err}`));
			}
		} // if bookmark emojis - end
	} // if in guild and not bot - end
}); // on messageReactionAdd - end

// Bot joins a new guild (server)
client.on('guildCreate', guild => {
	try {
		const config = JSON.parse(fs.readFileSync('./config.json', 'utf8')); // read in config file

		// if the guild is not already in the config file's list of guilds, add it to it
		if (!config.GUILD_LIST.find(g => g.id === guild.id)) {
			config.GUILD_LIST.push({ id: guild.id, name: guild.name });
			fs.writeFileSync('./config.json', JSON.stringify(config, null, 4), 'utf8');
		}
		deployCommands();

		console.log(`Joined server: ${guild.name} on ${new Date().toLocaleString('en-US', { timeZone: 'America/Winnipeg', timeZoneName: 'short' })}`);
	}
	catch (error) {
		console.log('Error adding guild to config guild list after joining server.');
		console.error(error);
	}
}); // on guildCreate - end

// Bot leaves a guild (server)
client.on('guildDelete', guild => {
	try {
		const config = JSON.parse(fs.readFileSync('./config.json', 'utf8')); // read in config file

			// if the guild is in the config file's list of guilds, remove it from it
		const index = config.GUILD_LIST.findIndex(g => g.id === guild.id);
		if (index !== -1) {
			config.GUILD_LIST.splice(index, 1);
			fs.writeFileSync('./config.json', JSON.stringify(config, null, 4), 'utf8');
		}

		console.log(`Left server: ${guild.name} on ${new Date().toLocaleString('en-US', { timeZone: 'America/Winnipeg', timeZoneName: 'short' })}`);
	}
	catch (error) {
		console.error('Error removing guild from config guild list after leaving server.', error);
	}
}); // on guildCreate - end

// On error
client.once('error', error => console.error(`Client ran into an error!\n\t${error}`));


// ----------------- SIGNALS -----------------------------------------------------------------------------------------------------------

// Signal handling for user termination request
process.once('SIGINT', () => {
	console.log('Client logging out and self-destructing...');
	client.destroy();
});

// Signal handling for after deploying commands
process.on('SIGUSR1', () => {
	console.log(`\nRebooting '${PROCESS_ID}' process...`);

    // pm2 restart app
	setTimeout(() => {
		const pm2 = require('pm2');// Import module for pm2
		pm2.connect((err) => {
			if (err) {
				console.error('\nSomething went wrong when connecting to pm2 process.', err);
				process.exit(2);
			}

			pm2.restart(PROCESS_ID, (err) => {
				pm2.disconnect();
				if (err) {
					console.error('\nSomething went wrong when restarting and disconnecting from pm2 process.', err);
					throw err;
				}
			});
		});
	}, 1000);
});// SIGUSR1 - end


// ----------------- FUNCTIONS -----------------------------------------------------------------------------------------------------------

// run the deplot-commands.js file, for when joining a new server
function deployCommands() {
	try {
		require('child_process').fork('./deploy-commands.js');
	}
	catch (error) {
		console.error(error);
		console.log('\nError in deployCommands()');
	}
}// deployCommands - end