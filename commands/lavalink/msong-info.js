const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('msong-info')
        .setDescription("See current song"),
    
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
                    .setDescription('- This command can only be used through slash command!\n- Please use `/msong-info` to see the track info.')
                    .setTimestamp();
                return await interaction.reply({ embeds: [embed] });
            }

            // Retrieve the player from the guild
            const player = interaction.client.manager.get(interaction.guild.id);
            if (!player) return interaction.reply(lang.noMusicPlaying);

            // Get the current track
            const track = player.queue.current;
            const durationInSeconds = Math.floor(track.duration / 1000); 
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;

            // Create the embed for the current song
            const nowPlayingEmbed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({ 
                    name: lang.nowPlayingTitle, 
                    iconURL: musicIcons.playerIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription(lang.nowPlayingDescription.replace('{trackTitle}', track.title))
                .setFooter({ text: lang.footerText, iconURL: musicIcons.footerIcon })
                .addFields([
                    { 
                        name: lang.durationLabel, 
                        value: `${minutes}:${seconds.toString().padStart(2, '0')}`, 
                        inline: true 
                    },
                    { name: lang.authorLabel, value: track.author, inline: true }
                ]);

            // Reply with the song information
            await interaction.reply({ embeds: [nowPlayingEmbed] });

        } catch (error) {


            // Create an error embed to send to the user
            const errorEmbed = new EmbedBuilder()
 .setColor('#1140c3')
                .setAuthor({
                    name: lang.alertMessage || 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/msong-info` to see the track info.')
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
