/* eslint-disable no-magic-numbers */
/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v2.0 | 2022-08-06
 */

"use strict";


module.exports = {
	dateString() {
		return new Date().toLocaleString('en-US', { timeZone: 'America/Winnipeg', timeZoneName: 'short' });
	},

	log(string, error, newlines) {
		const output = `${'\n'.repeat(Math.max(0, newlines))}${this.dateString()} - ${string}`;
		if (!error) {
			console.log(output);
		}
		else {
			console.error(output, error);
		}
	}
};