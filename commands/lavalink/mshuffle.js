const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mshuffle')
        .setDescription(lang.mshuffleDescription),
    
    async execute(interaction) {
        try {
            // Ensure it's a valid slash command interaction
            if (!interaction.isChatInputCommand()) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({
                        name: lang.mpauseAlert || 'Alert!',
                        iconURL: cmdIcons.dotIcon,
                        url: "https://discord.gg/Um8DsDEU9T"
                    })
                    .setDescription('- This command can only be used through a slash command.\n- Please use `/mshuffle` to shuffle the songs.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            // Retrieve the player for the guild
            const player = interaction.client.manager.get(interaction.guild.id);
            if (!player) return interaction.reply(lang.noMusicPlayingError);

            // Check if the queue has songs
            const queue = player.queue;
            if (!queue.length) return interaction.reply(lang.emptyQueueError);

            // Shuffle the queue
            player.queue.shuffle();

            // Create a shuffle success embed
            const shuffleEmbed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({ 
                    name: lang.queueUpdateTitle,
                    iconURL: musicIcons.correctIcon
                })
                .setDescription(lang.queueShuffledText)
                .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon });

            // Reply with the shuffle embed
            await interaction.reply({ embeds: [shuffleEmbed] });

        } catch (error) {


            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/mshuffle` to shuffle the track.')
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
