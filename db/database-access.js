/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.1 | 2022-07-07
 */

"use strict";

const pg = require('pg');
const { getClient } = require('./database-connection');

module.exports = {
	async getServerList(botId) {
		let result = null;
		const client = await getClient();

		if (client instanceof pg.Client) {
			const entries = await client.query('SELECT serverid, name FROM servers WHERE botid = $1', [botId]);
			result = entries?.rows;
		}
		else {
			console.log('Invalid database client in `getServerList`.');
		}

		return result;
	},

	async selectServer(botId, serverId) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const query = `
					SELECT serverid, name FROM servers
					WHERE botid = $1 AND serverid = $2
					;
				`;
				const entries = await client.query(query, [ botId, serverId ]);
				// console.log(Object.keys(entries.rows?.[0]).join('\t'));
				// console.log(`${entries.rows.map((r) => Object.values(r).join('\t')).join('\n')}`);

				result = entries?.rows;
			}
			catch (error) {
				console.error(`Error selecting serverId ${serverId}\n${error}`);
			}

			await client.end();
		}
		else {
			console.log('Invalid database client in `selectServer`.');
		}
		return result;
	},

	async insertServer(botId, serverId, serverName) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const query = `INSERT INTO servers(serverid, name, botid) VALUES ($2, $3, $1);`;
				await client.query(query, [ botId, serverId, serverName ]);
				console.log(`Inserted server "${serverName}"`);
				result = true;
			}
			catch (error) {
				console.error(`Error inserting serverId ${serverId}\n${error}`);
			}
			await client.end();
		}
		else {
			console.log('Invalid database client in `insertServer`.');
		}
		return result;
	},

	async removeServer(botId, serverId) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const query = `DELETE FROM servers WHERE botid = $1 AND serverid = $2;`;
				await client.query(query, [ botId, serverId ]);
				console.log(`Removed server with id "${serverId}"`);
				result = true;
			}
			catch (error) {
				console.log(`Error deleting serverId ${serverId}\n${error}`);
			}
			await client.end();
		}
		else {
			console.log('Invalid database client in `removeServer`.');
		}
		return result;
	},
};
