const { Manager } = require('erela.js');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../config.json');
const { Dynamic } = require("musicard");
const fs = require('fs');
const musicIcons = require('../UI/icons/musicicons');

module.exports = (client) => {
    if (config.categories.lavalink) {
        client.manager = new Manager({
            nodes: [
                {
                    host: config.lavalink.lavalink.host,
                    port: config.lavalink.lavalink.port,
                    password: config.lavalink.lavalink.password,
                    secure: config.lavalink.lavalink.secure
                }
            ],
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            },
            autoPlay: false, 
            volume: 50, 
        });

        client.manager.on('nodeConnect', node => {
            console.log(`\x1b[34m[ LAVALINK CONNECTION ]\x1b[0m Node connected: \x1b[32m${node.options.identifier}\x1b[0m`);
        });

        client.manager.on('nodeError', (node, error) => {});

        client.manager.on('trackStart', async (player, track) => {
            const channel = client.channels.cache.get(player.textChannel);
            try {
                let thumbnailUrl = '';
                if (track.uri.includes('youtube.com') || track.uri.includes('youtu.be')) {
                    const videoId = track.uri.split('v=')[1] || track.uri.split('/').pop();
                    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }

                const data = require('../UI/banners/musicard');
                const randomIndex = Math.floor(Math.random() * data.backgroundImages.length);
                const backgroundImage = data.backgroundImages[randomIndex];
                const musicCard = await Dynamic({
                    thumbnailImage: thumbnailUrl,
                    name: track.title,
                    author: track.author,
                    authorColor: "#00BFFF", // Sky blue color for author
                    progress: 50,
                    imageDarkness: 50, // Reduce darkness for a brighter look
                    nameColor: "#00BFFF", // Sky blue for track name
                    progressColor: "#00BFFF", // Sky blue for progress indicator
                    backgroundImage: backgroundImage,
                    backgroundColor: "rgba(135, 206, 250, 0.8)", // Sky blue background with opacity
                    progressBarColor: "#00BFFF", // Sky blue for progress bar
                    borderColor: "#00BFFF", // Optional: Sky blue border for the card
                    borderWidth: 2, // Optional: Increase border width for emphasis
                    borderRadius: 10, // Optional: Round corners for a modern look
                    shadow: "0 4px 20px rgba(0, 0, 0, 0.2)", // Optional: Add shadow for depth
                });
                

                fs.writeFileSync('musicard.png', musicCard);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "Now playing",
                        iconURL: musicIcons.playerIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription(`- Song name :**${track.title}**\n- Author :**${track.author}**`)
                    .setImage('attachment://musicard.png')
                    .setFooter({ text: 'Lavalink Player', iconURL: musicIcons.footerIcon })
                    .setColor('#1140c3');

                const attachment = new AttachmentBuilder('musicard.png', { name: 'musicard.png' });

                await channel.send({ embeds: [embed], files: [attachment] });
            } catch (error) {
                console.error('Error creating or sending music card:', error);
            }
        });

        client.manager.on('queueEnd', player => {
            const channel = client.channels.cache.get(player.textChannel);
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "Queue is Empty",
                    iconURL: musicIcons.beatsIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('**Leaving voice channel!**')
                .setFooter({ text: 'Lavalink Player', iconURL: musicIcons.footerIcon })
                .setColor('#1140c3');
            channel.send({ embeds: [embed] });
            player.destroy();
        });

        client.on('raw', d => client.manager.updateVoiceState(d));

        client.once('ready', () => {
            console.log('\x1b[35m[ MUSIC 2 ]\x1b[0m', '\x1b[32mLavalink Music System Active ✅\x1b[0m');
            client.manager.init(client.user.id);
        });

        client.manager.on('playerMove', (player, oldChannel, newChannel) => {
            if (!newChannel) player.destroy();
        });

        client.on('voiceStateUpdate', (oldState, newState) => {
            const player = client.manager.players.get(oldState.guild.id);
            if (!player || !player.voiceChannel) return;

            const botChannel = oldState.guild.members.me.voice.channel;
            if (!botChannel || botChannel.members.filter(member => !member.user.bot).size === 0) {
                player.destroy();
            }

            if (!oldState.serverMute && newState.serverMute) {
                const channel = client.channels.cache.get(player.textChannel);
                const embed = new EmbedBuilder()
                    .setDescription("🔇 I am muted!")
                    .setColor('#ff0000');
                channel.send({ embeds: [embed] });
            }
        });
    } else {
        console.log('\x1b[31m[ MUSIC 2 ]\x1b[0m', '\x1b[31mLavalink Music System Disabled ❌\x1b[0m');
    }
};
