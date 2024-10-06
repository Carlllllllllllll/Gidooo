const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mresume')
        .setDescription(lang.mresumeDescription),
    async execute(interaction) {
        try {
            // Check if interaction is a slash command
            if (!interaction.isChatInputCommand()) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.mpauseAlert || 'Alert!',
                        iconURL: musicIcons.dotIcon, // Assuming musicIcons here for mpause
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription('- This command can only be used through slash command!\n- Please use `/mresume` to resume the current song.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            const player = interaction.client.manager.get(interaction.guild.id);
            if (!player) return interaction.reply(lang.noMusicPlayingError);

            // Resume the music
            player.pause(false);
            const resumedEmbed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({
                    name: lang.songResumedTitle,
                    iconURL: musicIcons.pauseresumeIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                .setDescription(lang.songResumedText);

            return interaction.reply({ embeds: [resumedEmbed] });

        } catch (error) {
 

            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mresume` to resume the current track.')
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
