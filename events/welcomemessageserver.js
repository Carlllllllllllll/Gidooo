const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('guildCreate', async (guild) => {
    const webhookURL = process.env.WEBHOOK_URL;
    const serverCount = client.guilds.cache.size;

    // Create an invite link that never expires
    let inviteURL = '';
    try {
        const invites = await guild.invites.fetch();
        const existingInvite = invites.first(); // Get an existing invite if it exists
        if (existingInvite) {
            inviteURL = existingInvite.url;
        } else {
            const invite = await guild.channels.cache
                .filter(c => c.type === 0) // Filter for text channels
                .first()
                .createInvite({ maxAge: 0, unique: true });
            inviteURL = invite.url;
        }
    } catch (error) {
        console.error('Error creating invite link:', error);
    }

    // Get bot permissions as human-readable names
    const allPermissions = Object.keys(PermissionsBitField.Flags).map(key => ({
        name: key.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to readable format
        hasPermission: guild.members.me.permissions.has(PermissionsBitField.Flags[key])
    }));

    // Filter out permissions the bot actually has
    const botPermissions = allPermissions
        .filter(permission => permission.hasPermission)
        .map(permission => permission.name)
        .join(', ') || 'No permissions granted';

    // Webhook message data
    const webhookData = {
        content: `The bot has joined a new server! Now it's in ${serverCount} servers.`,
        embeds: [
            {
                title: `Joined Server`,
                description: `**Server Name:** ${guild.name}\n**Members Count:** ${guild.memberCount}\n**Invite Link:** [Click Here](${inviteURL})\n**Bot Permissions:** ${botPermissions}`,
                color: 0x00ff00,
                timestamp: new Date(),
            }
        ]
    };

    try {
        await axios.post(webhookURL, webhookData);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
    }

    // Find a suitable channel to send the welcome message
    let channel = guild.channels.cache.find(c => c.type === 0 && (c.name.includes('chat') || c.name.includes('general')));

    if (!channel) {
        channel = guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages));
    }

    if (channel) {
        // Create the welcome embed
        const embed = new EmbedBuilder()
            .setTitle('🎉 Hello, wonderful server! 🎉')
            .setDescription(`Thank you for inviting me to **${guild.name}**! 🥳\n\nI’m thrilled to be part of your community and can’t wait to assist you with a variety of **commands** and **fun features**! 🎊✨\n\nWant to see what I can do? Just type **/help** to explore all my amazing capabilities! 🚀💡\n\nLet’s make your server more exciting together! 🎈💖`)
            .setColor(0x00ff00)
            .setTimestamp();

        // Create buttons
        const websiteButton = new ButtonBuilder()
            .setLabel('Website')
            .setURL('https://gido-web.ooguy.com')  // Use setURL for a link button
            .setStyle(ButtonStyle.Link);

        const supportButton = new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.gg/Gq48UpPrXH')  // Use setURL for the support server link
            .setStyle(ButtonStyle.Link);

        // Create the ActionRow with buttons
        const row = new ActionRowBuilder()
            .addComponents(websiteButton, supportButton);

        // Send the welcome message with the embed and buttons
        try {
            await channel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    } else {
        console.log('No suitable text channel found to send the welcome message.');
    }
});

client.on('guildDelete', async (guild) => {
    const webhookURL = process.env.WEBHOOK_URL;
    const serverCount = client.guilds.cache.size;

    const webhookData = {
        content: `The bot has left a server! Now it's in ${serverCount} servers.`,
        embeds: [
            {
                title: `Left Server`,
                description: `**Server Name:** ${guild.name}`,
                color: 0xff0000,
                timestamp: new Date(),
            }
        ]
    };

    try {
        await axios.post(webhookURL, webhookData);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
    }

    // Attempt to fetch invite link
    let inviteURL = '';
    try {
        const invites = await guild.invites.fetch();
        const existingInvite = invites.first(); // Get an existing invite if it exists
        if (existingInvite) {
            inviteURL = existingInvite.url;
        } else {
            inviteURL = 'No Access'; // No invite link available
        }
    } catch (error) {
        inviteURL = 'No Access'; // Error fetching invites
    }

    // If the inviteURL is 'No Access', log this to the console
    if (inviteURL === 'No Access') {
        console.log(`Could not access invite link for ${guild.name}.`);
    }
});

client.login(process.env.TOKEN);
