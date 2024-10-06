const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mqueue')
        .setDescription(lang.mqueueDescription),
    async execute(interaction) {
        try {
            if (interaction.isCommand()) {
                // Slash command logic
                const player = interaction.client.manager.get(interaction.guild.id);
                if (!player) return interaction.reply(lang.noMusicPlayingError);

                const queue = player.queue;
                if (!queue.length) return interaction.reply(lang.queueEmptyError);

                const embeds = [];
                const tracksPerPage = 10;

                for (let i = 0; i < queue.length; i += tracksPerPage) {
                    const pageEmbed = new EmbedBuilder()
                        .setColor('#1140c3')
                        .setAuthor({
                            name: `${lang.queueTitle} - ${Math.floor(i / tracksPerPage) + 1}`,
                            iconURL: musicIcons.queueIcon
                        })
                        .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon });

                    const pageTracks = queue.slice(i, i + tracksPerPage);
                    let description = "";
                    for (let j = 0; j < pageTracks.length; j++) {
                        description += `${i + j + 1}. ${pageTracks[j].title} - ${pageTracks[j].author}\n`;
                    }
                    pageEmbed.setDescription(description);

                    embeds.push(pageEmbed);
                }

                await interaction.reply({ embeds });
            } else {
                // Handle non-slash command (prefix-based)
                const embed = new EmbedBuilder()
                     .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mqueue` command.')
                .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (error) {


            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mqueue` to see the current queue')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    async executePrefix(message) {
        try {
            const embed = new EmbedBuilder()
            .setAuthor({
                name: lang.alertMessage || 'Alert!',
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/Um8DsDEU9T"
            })
            .setDescription('- This command can only be used through slash command!\n- Please use `/mqueue` to see the current queue')
            .setTimestamp();
            
            return message.channel.send({ embeds: [embed] });
        } catch (error) {


            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mpause` command.')
                .setTimestamp();

            return message.channel.send({ embeds: [errorEmbed] });
        }
    }
};
