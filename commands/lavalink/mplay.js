const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mplay')
        .setDescription(lang.mplayDescription)
        .addStringOption(option => 
            option.setName('track').setDescription('Track name or URL').setRequired(true)
        ),
    async execute(interaction) {
        try {
            // Check if interaction is a slash command
            if (!interaction.isChatInputCommand()) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.mpauseAlert || 'Alert!',
                        iconURL: cmdIcons.dotIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription('- This command can only be used through slash command!\n- Please use `/play` to play a track.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            const { channel } = interaction.member.voice;
            if (!channel) return interaction.reply(lang.joinVoiceChannelError);
            const permissions = channel.permissionsFor(interaction.client.user);
            if (!permissions.has('CONNECT')) return interaction.reply(lang.connectPermissionError);
            if (!permissions.has('SPEAK')) return interaction.reply(lang.speakPermissionError);

            const player = interaction.client.manager.create({
                guild: interaction.guild.id,
                voiceChannel: channel.id,
                textChannel: interaction.channel.id,
            });

            if (player.state !== 'CONNECTED') player.connect();

            const search = interaction.options.getString('track');
            let res;

            try {
                res = await player.search(search, interaction.user);
                if (res.loadType === 'LOAD_FAILED') {
                    if (!player.queue.current) player.destroy();
                    throw new Error(res.exception.message);
                }
            } catch (err) {
                return interaction.reply(`${lang.searchError} ${err.message}`);
            }

            switch (res.loadType) {
                case 'NO_MATCHES':
                    if (!player.queue.current) player.destroy();
                    const noMatchesEmbed = new EmbedBuilder()
                        .setColor('#DC92FF')
                        .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                        .setAuthor({ name: lang.noResultsTitle, iconURL: musicIcons.wrongIcon });
                    return interaction.reply({ embeds: [noMatchesEmbed] });
                case 'TRACK_LOADED':
                    player.queue.add(res.tracks[0]);
                    if (!player.playing && !player.paused && !player.queue.size) player.play();
                    const trackLoadedEmbed = new EmbedBuilder()
                        .setColor('#DC92FF')
                        .setAuthor({ name: lang.trackEnqueuedTitle, iconURL: musicIcons.correctIcon })
                        .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                        .setDescription(`${lang.addingTrack} ${res.tracks[0].title}.`);
                    return interaction.reply({ embeds: [trackLoadedEmbed] });
                case 'PLAYLIST_LOADED':
                    player.queue.add(res.tracks);
                    if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
                    const playlistLoadedEmbed = new EmbedBuilder()
                        .setColor('#DC92FF')
                        .setAuthor({ name: lang.playlistEnqueuedTitle, iconURL: musicIcons.correctIcon })
                        .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                        .setDescription(`${lang.addingPlaylist} ${res.playlist.name} ${lang.withTracks} ${res.tracks.length} ${lang.tracks}.`);
                    return interaction.reply({ embeds: [playlistLoadedEmbed] });
                case 'SEARCH_RESULT':
                    player.queue.add(res.tracks[0]);
                    if (!player.playing && !player.paused && !player.queue.size) player.play();
                    const searchResultEmbed = new EmbedBuilder()
                        .setColor('#DC92FF')
                        .setAuthor({ name: lang.searchResultTitle, iconURL: musicIcons.correctIcon })
                        .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                        .setDescription(`${lang.addingTrack} ${res.tracks[0].title}.`);
                    return interaction.reply({ embeds: [searchResultEmbed] });
                default:
                    return interaction.reply(lang.unexpectedError);
            }
        } catch (error) {
 

            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mplay` to play a track.')
                .setTimestamp();

            // Try to send the error embed back to the user
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
