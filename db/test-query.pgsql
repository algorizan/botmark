CREATE TABLE servers(
	serverId	CHAR(18) PRIMARY KEY NOT NULL,
	name	VARCHAR(32) DEFAULT("default-server"),
	greetChannel	CHAR(18),
    generalChannel	CHAR(18),
    botLogChannel	CHAR(18),
    botChannel	CHAR(18),
    gamesChannel	CHAR(18),
    doGreeting	BOOLEAN DEFAULT(false),
    doReminders	BOOLEAN DEFAULT(true),
    doBookmarks	BOOLEAN DEFAULT(true),
    beMean	BOOLEAN DEFAULT(false),
);

CREATE TABLE daily_quotes(
	serverId	CHAR(18) PRIMARY KEY NOT NULL,
	doDailyQuotes	BOOLEAN DEFAULT(false),
	dqChannel	CHAR(18),
	timeHours	INTEGER DEFAULT(9),
	timeMins	INTEGER DEFAULT(0),
	frequencyH	INTEGER DEFAULT(24),
	lastQuoteIndex	INTEGER DEFAULT(0),
	quoteColor	CHAR(7) DEFAULT("#bf5ae6"),
	timeZone	VARCHAR(30) DEFAULT("America/Winnipeg"),
	FOREIGN KEY(serverId) REF servers,
);

CREATE TABLE fun_reminders(
	serverId	CHAR(18) NOT NULL,
	name	VARCHAR(32) NOT NULL,
	doFunReminders	BOOLEAN DEFAULT(false),
	timerAmountMins	INTEGER DEFAULT(60),
	startMark	INTEGER DEFAULT(0),
	funRemindersChannel	CHAR(18),
	funRemindersRoles	CHAR(18)[],
	timeRange	VARCHAR(11) DEFAULT(NULL),
	PRIMARY KEY(serverId, name),
	FOREIGN KEY(serverId) REF servers
);

CREATE TABLE users(
	userId	CHAR(18) NOT NULL,
	serverId	CHAR(18) NOT NULL,
	name	VARCHAR(32)  DEFAULT("default-san"),
	levelPts	INTEGER DEFAULT(0),
	pomodoro	INTEGER[3] DEFAULT({25,5,15}), -- format: {work,break,long break}
	timeZone	VARCHAR(32),
    numBookmarks	INTEGER DEFAULT(0),
	PRIMARY KEY(serverId, userId),
	FOREIGN KEY(serverId) REF servers
);

CREATE TABLE reminders(
	reminderId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	channelId	CHAR(18) NOT NULL,
	serverId	CHAR(18) NOT NULL,
	date	CHAR(24) NOT NULL,
	action	VARCHAR(300) NOT NULL,
	PRIMARY KEY(reminderId, userId, serverId),
	FOREIGN KEY(userId) REF users,
	FOREIGN KEY(serverId) REF users,
);

CREATE TABLE recurrent_reminders(
	reminderId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	channelId	CHAR(18) NOT NULL,
	serverId	CHAR(18) NOT NULL,
	action	VARCHAR(300) NOT NULL,
	active	BOOLEAN DEFAULT(true),
	timerAmountMins	INTEGER NOT NULL,
	startMark	INTEGER NOT NULL,
	timeRange	VARCHAR(11) DEFAULT(NULL),
	PRIMARY KEY(reminderId, userId, serverId),
	FOREIGN KEY(userId) REF users,
	FOREIGN KEY(serverId) REF users,
);

CREATE TABLE ranking(
	userId	CHAR(18) PRIMARY KEY NOT NULL,
	points	INTEGER DEFAULT(0),
	FOREIGN KEY(userId) REF users ON DELETE CASCADE
);


-- SELECT * FROM servers;