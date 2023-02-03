/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v2.0 | 2022-07-08
 */


-- create database discord_bots_db


CREATE TABLE bots(
	clientId	CHAR(18) PRIMARY KEY NOT NULL,
	botName	VARCHAR(32) UNIQUE NOT NULL,
	joinLink	VARCHAR(300)
);


CREATE TABLE servers(
	serverId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	name	VARCHAR(100) NOT NULL,
	greetChannel	CHAR(18),
    generalChannel	CHAR(18),
    botLogChannel	CHAR(18),
    botChannel	CHAR(18),
    gamesChannel	CHAR(18),
    doGreeting	BOOLEAN DEFAULT(false),
    doReminders	BOOLEAN DEFAULT(true),
    doBookmarks	BOOLEAN DEFAULT(true),
    beMean	BOOLEAN DEFAULT(false),
    bookmarkCount	INTEGER DEFAULT(0) NOT NULL,
	PRIMARY KEY(serverId, botId),
	FOREIGN KEY(botId) REFERENCES bots(clientId) ON DELETE NO ACTION
);

CREATE TABLE daily_quotes(
	serverId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	doDailyQuotes	BOOLEAN DEFAULT(false),
	dqChannel	CHAR(18),
	timeHours	INTEGER DEFAULT(9),
	timeMins	INTEGER DEFAULT(0),
	frequencyH	INTEGER DEFAULT(24),
	lastQuoteIndex	INTEGER DEFAULT(0),
	quoteColor	CHAR(7) DEFAULT('#bf5ae6'),
	timeZone	VARCHAR(50) DEFAULT('America/Winnipeg'),
	PRIMARY KEY(serverId, botId),
	FOREIGN KEY(serverId, botId) REFERENCES servers(serverId, botId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE fun_reminders(
	serverId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	name	VARCHAR(32) NOT NULL,
	doFunReminders	BOOLEAN DEFAULT(false),
	timerAmountMins	INTEGER DEFAULT(60),
	startMark	INTEGER DEFAULT(0),
	funRemindersChannel	CHAR(18),
	funRemindersRoles	CHAR(18)[],
	timeRange	VARCHAR(11) DEFAULT(NULL),
	PRIMARY KEY(serverId, botId, name),
	FOREIGN KEY(serverId, botId) REFERENCES servers(serverId, botId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE users(
	serverId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	name	VARCHAR(32)  DEFAULT('default-san'),
	levelPts	INTEGER DEFAULT(0),
	pomodoro	INTEGER[3] DEFAULT(ARRAY[25,5,15]), -- format: {work,break,long break}
	timeZone	VARCHAR(50) DEFAULT('America/Winnipeg'),
    bookmarkCount	INTEGER DEFAULT(0) NOT NULL,
	PRIMARY KEY(serverId, botId, userId),
	FOREIGN KEY(serverId) REFERENCES servers(serverId) ON DELETE CASCADE ON UPDATE CASCADE
	FOREIGN KEY(botId) REFERENCES servers(botId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reminders(
	reminderId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	channelId	CHAR(18) NOT NULL,
	serverId	CHAR(18) NOT NULL,
	date	CHAR(24) NOT NULL,
	action	VARCHAR(300) NOT NULL,
	PRIMARY KEY(reminderId, userId, serverId, botId),
	FOREIGN KEY(serverId, botId, userId) REFERENCES users(serverId, botId, userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE recurrent_reminders(
	reminderId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	serverId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	channelId	CHAR(18) NOT NULL,
	action	VARCHAR(300) NOT NULL,
	active	BOOLEAN DEFAULT(true),
	timerAmountMins	INTEGER NOT NULL,
	startMark	INTEGER NOT NULL,
	timeRange	VARCHAR(11) DEFAULT(NULL),
	PRIMARY KEY(reminderId, userId, serverId, botId),
	FOREIGN KEY(serverId, botId, userId) REFERENCES users(serverId, botId, userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ranking(
	serverId CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	points	INTEGER DEFAULT(0),
	PRIMARY KEY(serverId, botId, userId),
	FOREIGN KEY(serverId, botId, userId) REFERENCES users(serverId, botId, userId) ON DELETE CASCADE ON UPDATE CASCADE
);


-----------------------------------------------------------------------------------------------------------------------

-- INSERT BOTS
	INSERT INTO bots(clientid, botname, joinlink) VALUES ('911410913138081863', 'botmark', 'https://discord.com/api/oauth2/authorize?client_id=911410913138081863&permissions=117760&scope=bot%20applications.commands');

-- INSERT SERVERS
  -- BOTMARK
	INSERT INTO servers(serverid, name, botid) VALUES ('528382510455848963', 'Home', '911410913138081863');
	INSERT INTO servers(serverid, name, botid) VALUES ('724363919035990106', 'UManitoba Computer Science Lounge', '911410913138081863');
	INSERT INTO servers(serverid, name, botid) VALUES ('910356233507180566', 'Ladon''s Den', '911410913138081863');
