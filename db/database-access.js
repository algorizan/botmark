/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.1 | 2022-07-08
 */

"use strict";

const pg = require('pg');
const { getClient } = require('./database-connection');
const { dateString } = require('../src/utils');

module.exports = {
	async getServerList() {
		let result = null;
		const client = await getClient();

		if (client instanceof pg.Client) {
			const entries = await client.query('SELECT serverid, name FROM servers WHERE botid = $1', [process.env.CLIENT_ID]);
			result = entries?.rows;
		}
		else {
			console.log(dateString() + ' - Invalid database client in `getServerList`.');
		}

		return result;
	},

	async selectServer(serverId) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const query = `
					SELECT serverid, name FROM servers
					WHERE botid = $1 AND serverid = $2
					;
				`;
				const entries = await client.query(query, [ process.env.CLIENT_ID, serverId ]);
				// console.log(Object.keys(entries.rows?.[0]).join('\t'));
				// console.log(`${entries.rows.map((r) => Object.values(r).join('\t')).join('\n')}`);

				result = entries?.rows;
			}
			catch (error) {
				console.error(`${dateString()} - Error selecting serverId ${serverId}`, error);
			}

			await client.end();
		}
		else {
			console.log(dateString() + ' - Invalid database client in `selectServer`.');
		}
		return result;
	},

	async insertServer(serverId, serverName) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const selectQuery = `
					SELECT serverid, botid FROM servers
					WHERE botid = $1 AND serverid = $2
				;`;
				const entries = await client.query(selectQuery, [ process.env.CLIENT_ID, serverId ]);

				if(!entries || !entries.rowCount) {
					const insertQuery = `INSERT INTO servers(serverid, name, botid) VALUES ($2, $3, $1);`;
					await client.query(insertQuery, [ process.env.CLIENT_ID, serverId, serverName ]);
					console.log(`${dateString()} - Inserted server "${serverName}"`);
				}
				result = true;
			}
			catch (error) {
				console.error(`${dateString()} - Error inserting serverId ${serverId}`, error);
			}
			await client.end();
		}
		else {
			console.log(dateString() + ' - Invalid database client in `insertServer`.');
		}
		return result;
	},

	async removeServer(serverId) {
		let result = false;
		const client = await getClient();

		if (client instanceof pg.Client) {
			try {
				const selectQuery = `
					SELECT serverid, botid FROM servers
					WHERE botid = $1 AND serverid = $2
				;`;
				const entries = await client.query(selectQuery, [ process.env.CLIENT_ID, serverId ]);

				if(entries && entries.rowCount) {
					const deleteQuery = `DELETE FROM servers WHERE botid = $1 AND serverid = $2;`;
					await client.query(deleteQuery, [ process.env.CLIENT_ID, serverId ]);
					console.log(`${dateString()} - Removed server with id "${serverId}"`);
				}
				result = true;
			}
			catch (error) {
				console.error(`${dateString()} - Error deleting serverId ${serverId}`, error);
			}
			await client.end();
		}
		else {
			console.log(dateString() + ' - Invalid database client in `removeServer`.');
		}
		return result;
	},

	async incrementBookmarks(serverId, userId) {
		if (userId !== '256116869969215491') { // except for me, I don't count >:(
			const client = await getClient();
			if (client instanceof pg.Client) {
				try {
					const query = `
						UPDATE servers SET bookmarkcount = bookmarkcount + 1
						WHERE botid = $1 AND serverid = $2
						;
						UPDATE users SET bookmarkcount = bookmarkcount + 1
						WHERE botid = $1 AND serverid = $2 AND userid = $3
						;
					`;
					await client.query(query, [ process.env.CLIENT_ID, serverId, userId ]);
					console.log(`${dateString()} - Incremented bookmark count for user '${userId}' in serverId ${serverId}`);
				}
				catch (error) {
					console.error(`${dateString()} - Error incrementing bookmark count for user '${userId}' in serverId ${serverId}`, error);
				}
				await client.end();
			}
			else {
				console.log(dateString() + ' - Invalid database client in `incrementBookmarks`.');
			}
		}
	},

	async insertUser(serverId, userId, username) {
		const client = await getClient();
		if (client instanceof pg.Client) {
			try {
				const selectQuery = `
					SELECT serverid, botid, userid FROM users
					WHERE botid = $1 AND serverid = $2 AND userid = $3
				;`;
				const entries = await client.query(selectQuery, [ process.env.CLIENT_ID, serverId, userId ]);

				if (!entries || !entries.rowCount) {
					const insertQuery = `INSERT INTO users(serverid, botid, userid, name) VALUES($2, $1, $3, $4);`;
					await client.query(insertQuery, [ process.env.CLIENT_ID, serverId, userId, username ]);
					console.log(`${dateString()} - Inserted user ${username} into serverId ${serverId}`);
				}
			}
			catch (error) {
				console.error(`${dateString()} - Error inserting user ${username} in serverId ${serverId}`, error);
			}
			await client.end();
		}
		else {
			console.log(`${dateString()} - Invalid database client in \`insertUser\`.`);
		}
	},
};
