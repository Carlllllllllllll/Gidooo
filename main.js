const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const {  Dynamic } = require('musicard'); 
const config = require('./config.json');
const { printWatermark } = require('./events/handler');
const { EmbedBuilder } = require('@discordjs/builders');
const musicIcons = require('./UI/icons/musicicons'); 
const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
      return GatewayIntentBits[a];
    }),
  });


client.commands = new Collection();


const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

let totalCommands = 0; 

const commands = [];
const logDetails = []; 
printWatermark();
console.log('\x1b[33m%s\x1b[0m', '┌───────────────────────────────────────────┐');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
    const numCommands = commandFiles.length;

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, folder, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    const folderDetails = `Folder: ${folder}, Number of commands: ${numCommands}`;
    logDetails.push(folderDetails);
    console.log('\x1b[33m%s\x1b[0m', `│ ${folderDetails.padEnd(34)} `);
    totalCommands += numCommands; 
}
console.log('\x1b[35m%s\x1b[0m', `│ Total number of commands: ${totalCommands}`);
console.log('\x1b[33m%s\x1b[0m', '└───────────────────────────────────────────┘');



const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}








const antiSpam = require('./antimodules/antiSpam');
const antiLink = require('./antimodules/antiLink');
const antiNuke = require('./antimodules/antiNuke');
const antiRaid = require('./antimodules/antiRaid'); 


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
    console.log(`\x1b[31m[ CORE ]\x1b[0m \x1b[32mBot Name:  \x1b[0m${client.user.tag}`);
    console.log(`\x1b[31m[ CORE ]\x1b[0m \x1b[32mClient ID: \x1b[0m${client.user.id}`);
    antiSpam(client);
    antiLink(client);
    antiNuke(client);
    antiRaid(client);
    try {
        const registeredCommands = await rest.get(
            Routes.applicationCommands(client.user.id)
        );

 
        if (registeredCommands.length !== commands.length) {
            console.log('\x1b[31m[ LOADER ]\x1b[0m \x1b[32mLoading Slash Commands 🛠️\x1b[0m');

            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );

            console.log('\x1b[31m[ LOADER ]\x1b[0m \x1b[32mSuccessfully Loaded Slash commands for all Servers ✅\x1b[0m');
        } else {
            console.log('\x1b[31m[ LOADER ]\x1b[0m \x1b[32mSlash commands are already up to date ✅\x1b[0m');
        }

    } catch (error) {
        console.error('\x1b[31m[ERROR]\x1b[0m', error);
    }
});
const { connectToDatabase } = require('./mongodb');

connectToDatabase().then(() => {
    console.log('\x1b[36m[ DATABASE ]\x1b[0m', '\x1b[32mMongoDB Online ✅\x1b[0m');
}).catch(console.error);




    const data = require('./UI/banners/musicard'); 

    async function generateMusicCard(song) {
        try {
            
            const randomIndex = Math.floor(Math.random() * data.backgroundImages.length);
            const backgroundImage = data.backgroundImages[randomIndex];
           
            const musicCard = await Dynamic({
                thumbnailImage: song.thumbnail,
                name: song.name,
                author: song.formattedDuration,
                authorColor: "#1140c3",
                progress: 50,
                imageDarkness: 60,
                backgroundImage: backgroundImage, 
                nameColor: "#1140c3",
                progressColor: "#1140c3",
                progressBarColor: "#1140c3",
            });
    
            return musicCard;
        } catch (error) {
            console.error('Error generating music card:', error);
            throw error;
        }
    }


const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log(`🔗 Listening to Carl : http://localhost:${port}`);
});

client.login(process.env.TOKEN);

module.exports = client;


