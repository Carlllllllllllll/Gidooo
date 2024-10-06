const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mskip')
        .setDescription(lang.mskipDescription),

    async execute(interaction) {
        try {
            // Retrieve the player for the guild
            const player = interaction.client.manager.get(interaction.guild.id);
            if (!player) return interaction.reply({ content: lang.noMusicPlayingError, ephemeral: true });

            // Get the current track and skip it
            const currentTrack = player.queue.current;
            player.stop();

            let nextSongEmbed;
            if (player.queue.size > 0) {
                // Fetch the next track in the queue
                const nextTrack = player.queue.first();
                nextSongEmbed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.songSkippedTitle,
                        iconURL: musicIcons.skipIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                    .setDescription(`${lang.playingNextSongText}\n\n **${nextTrack.title}**`);
            } else {
                // No more songs left in the queue
                nextSongEmbed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.noSongsTitle,
                        iconURL: musicIcons.skipIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                    .setDescription(lang.noMoreTracksText);
            }

            // Send the embed with the next song or no songs left message
            await interaction.reply({ embeds: [nextSongEmbed] });

        } catch (error) {
            console.error(error);

            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mskip` to skip a track.')
                .setTimestamp();

            // Send the error response
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
