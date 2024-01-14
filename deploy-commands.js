/* eslint-disable no-magic-numbers */
/* eslint-disable no-await-in-loop */
/**
 * @author: Izan Cuetara Diez (a.k.a. algorizan)
 * @version: v2.0 | 2022-08-06
 * @fileoverview Botmark's command deployer
 */

"use strict";

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { getServerList } = require('./db/database-access');
const { log } = require('./src/utils');
const pm2 = require('pm2');

// Arrays in which to send all commands
const guildCommands = [];
// const globalCommands = [];
// Get all the command files from the appropriate directories
const guildCmdFiles = fs.readdirSync('./guild_commands').filter(file => file.endsWith('.js'));
// const globalCmdFiles = fs.readdirSync('./global_commands').filter(file => file.endsWith('.js'));

// Push all the guild commands to their array
for (const file of guildCmdFiles) {
	const command = require(`./guild_commands/${file}`);
	try { guildCommands.push(command.data.toJSON()); }
	catch(error) { log(`Error pushing ${file} file to guildCommands array`, error); }
}
// // Push all the global commands to their array
// for (const file of globalCmdFiles) {
// 	const command = require(`./global_commands/${file}`);
// 	try { globalCommands.push(command.data.toJSON()); }
// 	catch(error) { log(`Error pushing ${file} file to globalCommands array`, error); }
// }

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN_BOTMARK);
const PROCESS_ID = 'botmark';

(async () => {
	try {
		log('Started reloading application commands.', null, 1);

		// // Global commands
		// await rest.put(
		// 	Routes.applicationCommands(process.env.CLIENT_ID),
		// 	{ body: globalCommands },
		// );
		// log('- Registered global commands.');

		// Guild commands
		const guildList = await getServerList();
		for (const guild of guildList) {
			// for all files in /guild_commands
			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.serverid),
				{ body: guildCommands },
			);
			log(`- Registered commands for server: ${guild.name}`);
		}// guild list for - end

		log('- Successfully reloaded application commands.');
	}
	catch (error) {
		log('- Something went wrong when reloading application commands.', error);
	}
})();

// pm2 restart app
setTimeout(() => {
	log(`Attempting to connect to pm2 to restart '${PROCESS_ID}' process...`, null, 1);

	// connect to pm2 process manager
	pm2.connect((err) => {
		if (err) {
			log(`Something went wrong when connecting to '${PROCESS_ID}' process from deploy-commands.js.`, err, 2);
			process.exit(2);
		}

		// Fetch the list of processes managed by pm2
		pm2.list((err, list) => {
			if (err) {
				log(`Something went wrong when fetching the list of pm2 processes in deploy-commands.js.`, err, 2);
				process.exit(2);
			}

			// Find the process with the right name and send it the SIGUSR1 signal that will make it reboot
			const processDescription = list.find(proc => proc.name === PROCESS_ID);
			if (processDescription && processDescription.pm2_env.status === "online") {
				log(`Now restarting ${processDescription.name} process.`);
				require('./index.js').reboot();
			}
			else {
				log(`${processDescription.name} process is currently not online, no need to restart it.`);
			}
		});

		// Disconnect from pm2
		setTimeout(() => {
			pm2.disconnect();
			log(`Disconnected from pm2.`);
		}, 1000);
	});
}, 1000);