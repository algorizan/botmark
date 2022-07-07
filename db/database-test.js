/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.1 | 2022-07-04
 */

"use strict";

const pg = require('pg');
const { getClient } = require('./database-connection');

(async () => {
	const client = await getClient();

	if (client instanceof pg.Client) {
		const botid = '911410913138081863';
		const query = `
			SELECT * FROM servers
			WHERE botid = $1
			;
		`;
		const entries = await client.query(query, [botid]);
		console.log(Object.keys(entries.rows?.[0]).join('\t'));
		console.log(`${entries.rows.map((r) => Object.values(r).join('\t')).join('\n')}`);

		await client.end();
	}
	else {
		console.log('Invalid database client.');
	}
})();
