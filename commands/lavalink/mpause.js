const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage') || {}; // Ensure lang is initialized

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mpause')
        .setDescription(lang.mpauseDescription || 'Pause the current song'),
    async execute(interaction) {
        try {
            // Use isCommand instead of isChatInputCommand
            if (interaction.isCommand()) {
                const player = interaction.client.manager.get(interaction.guild.id);

                if (!player) {
                    const embed = new EmbedBuilder()
                        .setColor('#1140c3')
                        .setDescription(lang.noPlayer || 'No player found.');
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }

                player.pause(true);
                const pausedEmbed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.songPausedTitle || 'Song Paused',
                        iconURL: musicIcons.pauseresumeIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setFooter({ text: lang.footerText || 'Lavalink Player', iconURL: musicIcons.footerIcon })
                    .setDescription(lang.songPausedDescription || '**The current song has been paused.**');

                await interaction.reply({ embeds: [pausedEmbed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.mpauseAlert || 'Alert!',
                        iconURL: cmdIcons.dotIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription('- This command can only be used through slash command!\n- Please use `/mpause` to pause the current song.')
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
  

            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
            .setColor('#1140c3')
                    .setAuthor({
                        name: lang.mpauseAlert || 'Alert!',
                        iconURL: cmdIcons.dotIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription('- This command can only be used through slash command!\n- Please use `/mpause` to pause the current song')
                    .setTimestamp();


            // Try to send the error embed back to the user
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
