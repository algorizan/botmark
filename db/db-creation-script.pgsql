/**
 * @author: Izan Cuetara Diez (a.k.a. Unstavle)
 * @version: v1.1 | 2022-07-06
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
	timeZone	VARCHAR(30) DEFAULT('America/Winnipeg'),
	PRIMARY KEY(serverId, botId),
	FOREIGN KEY(serverId, botId) REFERENCES servers(serverId, botId) ON DELETE CASCADE
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
	FOREIGN KEY(serverId, botId) REFERENCES servers(serverId, botId) ON DELETE CASCADE
);

CREATE TABLE users(
	serverId	CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	name	VARCHAR(32)  DEFAULT('default-san'),
	levelPts	INTEGER DEFAULT(0),
	pomodoro	INTEGER[3] DEFAULT(ARRAY[25,5,15]), -- format: {work,break,long break}
	timeZone	VARCHAR(32),
    numBookmarks	INTEGER DEFAULT(0),
	PRIMARY KEY(serverId, botId, userId),
	FOREIGN KEY(serverId, botId) REFERENCES servers(serverId, botId) ON DELETE CASCADE
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
	FOREIGN KEY(serverId, botId, userId) REFERENCES users(serverId, botId, userId) ON DELETE CASCADE
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
	FOREIGN KEY(serverId, botId, userId) REFERENCES users(serverId, botId, userId) ON DELETE CASCADE
);

CREATE TABLE ranking(
	serverId CHAR(18) NOT NULL,
	botId	CHAR(18) NOT NULL,
	userId	CHAR(18) NOT NULL,
	points	INTEGER DEFAULT(0),
	PRIMARY KEY(serverId, botId, userId),
	FOREIGN KEY(serverId, botId, userId) REFERENCES users(serverId, botId, userId) ON DELETE CASCADE
);


-----------------------------------------------------------------------------------------------------------------------

-- INSERT BOTS
	INSERT INTO bots(clientid, botname, joinlink) VALUES ('911410913138081863', 'botmark', 'https://discord.com/api/oauth2/authorize?client_id=911410913138081863&permissions=117760&scope=bot%20applications.commands');
	INSERT INTO bots(clientid, botname, joinlink) VALUES ('821579335533592597', 'ladon', 'https://discord.com/api/oauth2/authorize?client_id=821579335533592597&permissions=544857386096&scope=bot%20applications.commands');


-- INSERT SERVERS
  -- BOTMARK
	INSERT INTO servers(serverid, name, botid) VALUES ('528382510455848963', 'Home', '911410913138081863');
	INSERT INTO servers(serverid, name, botid) VALUES ('724363919035990106', 'UManitoba Computer Science Lounge', '911410913138081863');
	INSERT INTO servers(serverid, name, botid) VALUES ('910356233507180566', 'Ladon''s Den', '911410913138081863');

  -- LADON
	INSERT INTO servers(serverid, name, botid, greetchannel, generalchannel, botlogchannel, botchannel, dogreeting, doreminders, dobookmarks, bemean) VALUES ('528382510455848963', 'Home', '821579335533592597', '821575100225814550', '847915742124179506', '846786894947287111', '845521309513154610', true, true, true, false);
	INSERT INTO servers(serverid, name, botid, greetchannel, generalchannel, botlogchannel, botchannel, gameschannel, dogreeting, doreminders, dobookmarks, bemean) VALUES ('782789966979137546', 'academics unite!', '821579335533592597', '796105215287230494', '782789967440379921', '801611692424691763', '845521309513154610', '845521309513154610', false, true, true, false);
	INSERT INTO servers(serverid, name, botid, greetchannel, generalchannel, botlogchannel, botchannel, gameschannel, dogreeting, doreminders, dobookmarks, bemean) VALUES ('911652590327050260', 'Rincón de Dani & Izan', '821579335533592597', '911652590327050264', '911652590327050264', '911664985053208576', '911665264037339196', '911665264037339196', true, true, true, false);


-- INSERT DAILY QUOTES (LADON)
	INSERT INTO daily_quotes(serverId, botid, dodailyquotes, dqchannel, timehours, timemins, frequencyh, lastquoteindex, quotecolor, timezone) VALUES ('528382510455848963', '821579335533592597', false, '855523675523383356', 9, 0, 24, 0, '#bf5ae6', 'Atlantic/Reykjavik');
	INSERT INTO daily_quotes(serverId, botid, dodailyquotes, dqchannel, timehours, timemins, frequencyh, lastquoteindex, quotecolor, timezone) VALUES ('782789966979137546', '821579335533592597', true, '811485348932091934', 9, 0, 24, 79, '#bf5ae6', 'America/Winnipeg');
	INSERT INTO daily_quotes(serverId, botid, dodailyquotes, timehours, timemins, frequencyh, lastquoteindex, quotecolor, timezone) VALUES ('911652590327050260', '821579335533592597', false, 9, 0, 24, 0, '#bf5ae6', 'Atlantic/Reykjavik');


-- INSERT FUN REMINDERS (LADON)
  -- HOME
    INSERT INTO fun_reminders(serverid, botid, name, dofunreminders, timeramountmins, startmark, funreminderschannel, funremindersroles) VALUES ('528382510455848963', '821579335533592597', 'hourlyReminder', false, 60, 15, '829928277828435998', ARRAY['829929474266234880', '830166751056494682']);
    INSERT INTO fun_reminders(serverid, botid, name, dofunreminders, timeramountmins, startmark, funreminderschannel, funremindersroles) VALUES ('528382510455848963', '821579335533592597', 'eliReminder', false, 120, 60, '829928277828435998', ARRAY['829929131876548618']);
    INSERT INTO fun_reminders(serverid, botid, name, dofunreminders, timeramountmins, startmark, funreminderschannel, funremindersroles) VALUES ('528382510455848963', '821579335533592597', 'unclench', false, 45, 0, '829928277828435998', ARRAY['858760976417554453']);
    INSERT INTO fun_reminders(serverid, botid, name, dofunreminders, timeramountmins) VALUES ('528382510455848963', '821579335533592597', 'test', false, 60);

  -- ACADEMICS UNITE!
    INSERT INTO fun_reminders(serverid, botid, name, dofunreminders, timeramountmins, startmark, funreminderschannel, funremindersroles) VALUES ('782789966979137546', '821579335533592597', 'hourlyReminder', true, 60, 0, '801148292628217887', ARRAY['801146681760284722', '801146674587631696', '802097707790762005', '802677786245595176', '808061280367280129']);


-- INSERT USERS (LADON)
  -- HOME
    INSERT INTO users(serverid, botid, userid, name, levelpts, pomodoro, timezone) VALUES ('528382510455848963', '821579335533592597', '256116869969215491', 'Izan', 314, ARRAY[30,7,20], 'America/Winnipeg');
    INSERT INTO users(serverid, botid, userid, name, levelpts, timezone) VALUES ('528382510455848963', '821579335533592597', '829144388298342430', 'algorythmic', 4, 'GMT');
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('528382510455848963', '821579335533592597', '177662259923910657', 'eli', 7);

  -- ACADEMICS UNITE!
    INSERT INTO users(serverid, botid, userid, name, levelpts, pomodoro, timezone) VALUES ('782789966979137546', '821579335533592597', '256116869969215491', 'Izan (notionblr)', 314, ARRAY[30,7,20], 'America/Winnipeg');
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '674575991913447455', '𝖘𝖆𝖕𝖕𝖍𝖔𝖊 (sapphic-poets-society)', 13);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '748293678795325450', 'buse ♡ | @multilingue', 53);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '315546744429477888', 'Liz (Studying-politics)', 5);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '690880012303204362', 'lulu | @lulutheblog -', 122);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '727978160100081695', 'Sarah (sarahstudieschem)', 42);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '647619653081759745', 'emma! (seltzerstudies)', 11);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '694615800170020974', 'Bee (tea-inquiries)', 6);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '627381153371914250', 'lee (hyperchemblr)', 34);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '177662259923910657', 'eli (studycore)', 7);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '692975974744326164', 'molly/nox', 18);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '678165164729565186', 'ciel-adrienne !', 35);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '562827550095704074', 'sally (killerhailstudies)', 2);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '473655500140183572', 'julia (No Tumblr', 5);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '562792865810481153', 'Remy | adhdanomaly', 22);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '582210728040202241', 'Kat (theorganisedkat)', 17);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '696087491949887488', 'Carla (brainy-anxious)', 10);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '628044456557412362', 'han (sapphicstemstudies)', 1);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '309497105792106498', 'Courtney (coffeeandlinguistics)', 10);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '801216961681424411', 'fianna (theoctoberscholar)', 7);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '732588171560353895', 'Lenny', 9);
    INSERT INTO users(serverid, botid, userid, name, levelpts) VALUES ('782789966979137546', '821579335533592597', '239288358956826624', 'Michael (No Tumblr)', 0);

  -- Rincón de Dani & Izan
    INSERT INTO users(serverid, botid, userid, name, levelpts, pomodoro, timezone) VALUES ('911652590327050260', '821579335533592597', '256116869969215491', 'Izan', 314, ARRAY[30,7,20], 'America/Winnipeg');
    INSERT INTO users(serverid, botid, userid, name, levelpts, timezone) VALUES ('911652590327050260', '821579335533592597', '857957906338152468', 'Dani', 8, 'GMT');


-- INSERT RANKINGS (LADON)
  -- HOME
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('528382510455848963', '821579335533592597', '256116869969215491', 314);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('528382510455848963', '821579335533592597', '177662259923910657', 7);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('528382510455848963', '821579335533592597', '829144388298342430', 4);
  -- ACADEMICS UNITE!
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '256116869969215491', 314);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '690880012303204362', 122);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '748293678795325450', 53);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '727978160100081695', 42);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '678165164729565186', 35);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '627381153371914250', 34);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '562792865810481153', 22);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '692975974744326164', 18);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '582210728040202241', 17);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '674575991913447455', 13);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '647619653081759745', 11);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '696087491949887488', 10);
    INSERT INTO ranking(serverid, botid, userid, points) VALUES ('782789966979137546', '821579335533592597', '309497105792106498', 10);

