/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.1 | 2022-07-07
 */

"use strict";


module.exports = {
	dateString() {
		return new Date().toLocaleString('en-US', { timeZone: 'America/Winnipeg', timeZoneName: 'short' });
	}
};