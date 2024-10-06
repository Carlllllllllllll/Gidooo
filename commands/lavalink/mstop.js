const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mstop')
        .setDescription('Stops the current music'),
    
    async execute(interaction) {
        try {
            // Ensure it's a valid slash command interaction
            if (!interaction.isChatInputCommand()) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.mpauseAlert || 'Alert!',
                        iconURL: musicIcons.stopIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription('- This command can only be used through a slash command.\n- Please use `/mstop` to stop the track.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            // Retrieve the player for the guild
            const player = interaction.client.manager.players.get(interaction.guild.id);

            // Check if a player exists and music is playing
            if (!player || !player.queue.current) {
                return interaction.reply(lang.noMusicPlayingError);
            }

            // Destroy the player, effectively stopping the music and clearing the queue
            player.destroy();

            // Create an embed indicating that the music has stopped
            const stoppedEmbed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({
                    name: lang.stoppedTitle,
                    iconURL: musicIcons.stopIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                .setDescription(lang.queueStoppedText);

            // Reply with the stopped embed
            await interaction.reply({ embeds: [stoppedEmbed] });

        } catch (error) {


            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mstop` to stop the track.')
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
