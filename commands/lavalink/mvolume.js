const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mvolume')
        .setDescription(lang.mvolumeDescription)
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('Set the volume level (0-100)')
                .setRequired(false)
        ),
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
                    .setDescription('- This command can only be used through slash command!\n- Please use `/mvolume` to set the volume of the track.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            const player = interaction.client.manager.get(interaction.guild.id);
            if (!player) return interaction.reply(lang.noMusicPlayingError);

            const volumeEmbed = new EmbedBuilder().setColor('#1140c3');
            const volumeArg = interaction.options.getInteger('volume');

            // If no volume argument is provided, show current volume
            if (volumeArg === null) {
                volumeEmbed
                    .setAuthor({
                        name: lang.volumeControlTitle,
                        iconURL: musicIcons.volumeIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                    .setDescription(`${lang.currentVolumeText} ${player.volume}%`);
                return interaction.reply({ embeds: [volumeEmbed] });
            }

            // Handle invalid volume input
            if (isNaN(volumeArg)) return interaction.reply(lang.invalidNumberError);

            const volume = Math.max(Math.min(volumeArg, 100), 0);
            player.setVolume(volume);

            volumeEmbed
                .setAuthor({
                    name: lang.volumeControlTitle,
                    iconURL: musicIcons.volumeIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                .setDescription(`${lang.volumeSetText} ${volume}%`);
            interaction.reply({ embeds: [volumeEmbed] });

        } catch (error) {
 

            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mvolume` to set the volume of the track.')
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
 