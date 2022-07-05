/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.1 | 2022-07-04
 */

"use strict";

const pg = require('pg');
const { getClient } = require('./database-connection');

const client = getClient();

if (client instanceof pg.Client) {
	client.connect();

	const query = `
		CREATE TABLE IF NOT EXISTS botmark_data(
			id BIGINT PRIMARY KEY NOT NULL,
			name VARCHAR(32),

		);
	`;
	client.query(query, (err, result) => {
		if (err) throw err;

		for (const row of result) {
			console.log(JSON.stringify(row));
		}
	});

}
else {
	console.log('Invalid database client.');
}
