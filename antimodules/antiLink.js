const { EmbedBuilder } = require('discord.js');
const { antisetupCollection, anticonfigcollection } = require('../mongodb');

const antiLink = (client) => {
    const linkMap = new Map();
    console.log('\x1b[36m[ SECURITY ]\x1b[0m', '\x1b[32mAnti - Link System Active ✅\x1b[0m');

    client.on('messageCreate', async (message) => {
        if (!message.guild) return;

        const { author, content, channel, guild } = message;
        if (author.bot) return;

        try {
            // Fetch guild configurations
            const guildConfig = await antisetupCollection.findOne({ serverId: guild.id });
            const settings = guildConfig?.antiLink;
            if (!settings?.enabled) return;

            // Fetch anti-link configurations
            const antiConfig = await anticonfigcollection.findOne({ serverId: guild.id });
            const whitelistedChannels = antiConfig?.whitelisted_antilink_channels || [];
            const whitelistedLinkTypes = antiConfig?.whitelisted_antilink_types || [];
            const { owners = [], admins = [] } = guildConfig || {};

            // Check if the author is an owner or admin
            if (
  owners.includes(author.id) ||
  admins.includes(author.id) ||
  message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
) return;


            // Check if the channel is whitelisted
            if (whitelistedChannels.includes(channel.id)) return;

            // Check for links in the message
            const linkRegex = /https?:\/\/\S+/gi;
            const links = content.match(linkRegex);
            if (links) {
                // Check if the link type is whitelisted
                const isWhitelistedLink = links.some(link =>
                    whitelistedLinkTypes.some(type => new URL(link).hostname.includes(type))
                );
                if (isWhitelistedLink) return;

                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setTitle('Link Detection')
                    .setDescription(`Links were detected in a message.`)
                    .addFields(
                        { name: 'User', value: `${author} (${author.id})`, inline: true },
                        { name: 'Channel', value: `${channel} (${channel.id})`, inline: true },
                        { name: 'Message Content', value: content, inline: false },
                        { name: 'Links Detected', value: links.join(', '), inline: false }
                    )
                    .setTimestamp();

                // Handle link deletion based on settings mode
                if (settings.mode === 'full') {
                    await message.delete();
                    await channel.send(`${author}, posting links is not allowed!`);
                    await logLinkDetection(guildConfig, embed);
                } else if (settings.mode === 'partial') {
                    const currentTime = Date.now();
                    const lastLinkTime = linkMap.get(author.id) || 0;

                    if (currentTime - lastLinkTime < settings.linkInterval) {
                        await message.delete();
                        await channel.send(`${author}, you can only post links every ${settings.linkInterval / 1000} seconds!`);
                        await logLinkDetection(guildConfig, embed);
                    } else {
                        linkMap.set(author.id, currentTime);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching server configuration or processing data:', error);
        }
    });

    const logLinkDetection = async (guildConfig, embed) => {
        const logChannel = client.channels.cache.get(guildConfig.logChannelId);
        if (logChannel) {
            try {
                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Failed to send log message:', error);
            }
        } else {
            console.error('Log channel not found or bot lacks permissions.');
        }
    };
};

module.exports = antiLink;
