const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mremove')
        .setDescription(lang.mremoveDescription)
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('The track number to remove')
                .setRequired(true)
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
                    .setDescription('- This command can only be used through slash command!\n- Please use `/mremove` to remove a track.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            const player = interaction.client.manager.get(interaction.guild.id);
            if (!player) return interaction.reply(lang.noMusicPlayingError);

            const index = interaction.options.getInteger('index');
            if (index < 1 || index > player.queue.size) {
                return interaction.reply(lang.invalidTrackNumberError);
            }

            const removed = player.queue.remove(index - 1);
            const removeEmbed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({
                    name: lang.removedSongTitle,
                    iconURL: musicIcons.skipIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                .setDescription(`${lang.removedSongText} ${removed[0].title}`);

            return interaction.reply({ embeds: [removeEmbed] });

        } catch (error) {
 

            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mremove` to remove a track.')
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
