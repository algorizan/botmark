/**
 * @author: Izan Cuetara Diez (a.k.a. algorizan)
 * @version: v2.1 | 2024-01-14
 */

"use strict";

const pg = require('pg');
const { getClient } = require('./db-connection');
const { log } = require('../src/utils');

module.exports = {
	async getServerList() {
		let result = null;
		const client = await getClient();

		if (client instanceof pg.Client) {
			const entries = await client.query('SELECT serverid, name FROM server');
			result = entries?.rows;
		}
		else {
			log('- Invalid database client in `getServerList`.');
		}

		return result;
	},

	async selectServer(serverId) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const query = `
					SELECT serverid, name FROM server
					WHERE serverid = $1
					;
				`;
				const entries = await client.query(query, [serverId]);

				result = entries?.rows;
			}
			catch (error) {
				log(`Error selecting serverId ${serverId}`, error);
			}

			await client.end();
		}
		else {
			log('- Invalid database client in `selectServer`.');
		}
		return result;
	},

	async insertServer(serverId, serverName) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const selectQuery = `
					SELECT serverid FROM server
					WHERE serverid = $1
				;`;
				const entries = await client.query(selectQuery, [serverId]);

				if(!entries || !entries.rowCount) {
					const insertQuery = `INSERT INTO server(serverid, name) VALUES ($1, $2);`;
					await client.query(insertQuery, [ serverId, serverName ]);
					log(`Inserted server "${serverName}"`);
					result = true;
				}
				else {
					log(`Server "${serverName}" was found already in database`);
				}
			}
			catch (error) {
				log(`Error inserting serverId ${serverId}`, error);
			}
			await client.end();
		}
		else {
			log('- Invalid database client in `insertServer`.');
		}
		return result;
	},

	async removeServer(serverId) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const selectQuery = `
					SELECT serverid FROM server
					WHERE serverid = $1
				;`;
				const entries = await client.query(selectQuery, [serverId]);

				if(entries && entries.rowCount) {
					const deleteQuery = `DELETE FROM server WHERE serverid = $1;`;
					await client.query(deleteQuery, [serverId]);
					log(`Removed server with id "${serverId}"`);
					result = true;
				}
				else {
					log(`Server with id "${serverId}" was not found in database`);
				}
			}
			catch (error) {
				log(`Error deleting serverId ${serverId}`, error);
			}
			await client.end();
		}
		else {
			log('- Invalid database client in `removeServer`.');
		}
		return result;
	},

	async incrementBookmarks(serverId, userId) {
		if (userId !== '256116869969215491') { // except for me, I don't count
			const client = await getClient();
			if (client instanceof pg.Client) {
				try {
					const queryServer = `
						UPDATE server SET bookmarkcount = bookmarkcount + 1
						WHERE serverid = $1
						;
					`;
					await client.query(queryServer, [serverId]);
					log(`Incremented bookmark count for user '${userId}' in serverId ${serverId}`);
				}
				catch (error) {
					log(`Error incrementing bookmark count for user '${userId}' in serverId ${serverId}`, error);
				}
				await client.end();
			}
			else {
				log('- Invalid database client in `incrementBookmarks`.');
			}
		}
	},
};
