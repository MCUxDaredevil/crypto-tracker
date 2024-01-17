const { REST, Routes } = require('discord.js');
require('dotenv').config();

const clientId = '813827939011264542';
const guildId = '759539934557110272';
const token = process.env.BOT_TOKEN;

const rest = new REST().setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);
rest.put(Routes.applicationCommands(clientId), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
