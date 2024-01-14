<!--
 * @file README.md
 * @author Izan Cuetara Diez (a.k.a. algorizan)
 * @version v2.0 | 2022-08-06
 * @fileoverview Botmark's README
-->

# Botmark

### Discord bot to bookmark messages by sending them to the user's Private Messages.

* **Users can Bookmark a message by right-clicking the message and in the context menu going to *Apps -> Bookmark*.**
* Alternatively, users can react to a message with the `:bookmark:` or `:bookmark_tabs:` emojis for the same effect. (This is necessary for mobile users, since the context menu button is inaccessible from the Discord mobile app)


- Bookmarked messages are sent to the user's Private Messages in a nicely formatted embed, including any file or photo attachments or embeds from the original message. It also says who sent the message, when, on what server and channel, and links you to the original message (if you still have access to that channel & the message hasn't been deleted).

> <u>Note</u>: to be able to use the Context Menu commands in a channel, Slash Commands must be enabled for that channel. And for reactions to trigger a bookmark, the bot must have access to that channel.

***

<br/>

# Demo

### 1. Right-click a message and select Botmark's button from the Context Menu:

![Example bookmarked message.](https://github.com/algorizan/botmark/blob/master/docs/images/botmark_context_menu.png?raw=true)

***

### 2. If the Bookmark was successful, you will see an ephemeral message that only you can see:

![Example bookmarked message.](https://github.com/algorizan/botmark/blob/master/docs/images/botmark_confirmation.png?raw=true)

***

### 3. You will receive a private message from Botmark with the bookmarked message.

- For a message that looks like this:

	![Example bookmarked message.](https://github.com/algorizan/botmark/blob/master/docs/images/botmark_sample_message.png?raw=true)

- The corresponding Bookmark will look like this:

	![Example bookmarked message.](https://github.com/algorizan/botmark/blob/master/docs/images/botmark_sample_bookmark.png?raw=true)

***

### 4. Any time in the future, you can delete the Bookmark by pressing the red *Delete Bookmark* button. After doing that, you will receive an ephemeral message giving you a chance to recover the bookmark by pressing an *Undo* button:

![Example bookmarked message.](https://github.com/algorizan/botmark/blob/master/docs/images/botmark_message_deleted.png?raw=true)

However, after 1 minute, the *Undo* button will expire and the Bookmark will have been deleted forever:

![Example bookmarked message.](https://github.com/algorizan/botmark/blob/master/docs/images/botmark_message_deleted_expired.png?raw=true)

***
<br/>

<!-- # Links
## [**<u>Add Botmark to your server</u>**](https://discord.com/api/oauth2/authorize?client_id=911410913138081863&permissions=66560&scope=applications.commands%20bot)

***
<br/>

### **Discord server** to ask questions or offer suggestions: https://discord.gg/dzWmAUZXUT

<br/>

### **Top.gg** website: https://top.gg/bot/911410913138081863

<br/>

*** -->