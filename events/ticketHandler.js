const { ticketsCollection } = require('../mongodb');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const ticketIcons = require('../UI/icons/ticketicons');

const PING_COOLDOWN_DURATION = 24 * 60 * 60 * 1000;
const TICKET_COOLDOWN_DURATION = 20 * 60 * 60 * 1000;

let config = {};

async function loadConfig() {
    try {
        const tickets = await ticketsCollection.find({}).toArray();
        config.tickets = tickets.reduce((acc, ticket) => {
            acc[ticket.serverId] = {
                ticketChannelId: ticket.ticketChannelId,
                adminRoleId: ticket.adminRoleId,
                status: ticket.status
            };
            return acc;
        }, {});
    } catch (err) {}
}

setInterval(loadConfig, 5000);

module.exports = (client) => {
    if (!client.cooldowns) {
        client.cooldowns = new Map();
    }

    if (!client.ticketCooldowns) {
        client.ticketCooldowns = new Map();
    }

    if (!client.pingAdminCooldowns) {
        client.pingAdminCooldowns = new Map();
    }

    client.on('ready', async () => {
        await loadConfig();
        monitorConfigChanges(client);
    });

    client.on('interactionCreate', async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_type') {
            await handleSelectMenu(interaction, client);
        } else if (interaction.isButton()) {
            if (interaction.customId.startsWith('close_ticket_')) {
                await handleCloseButton(interaction, client);
            } else if (interaction.customId === 'ping_admins') {
                await handlePingAdminsButton(interaction, client);
            }
        }
    });
};

async function monitorConfigChanges(client) {
    let previousConfig = JSON.parse(JSON.stringify(config));

    setInterval(async () => {
        await loadConfig();
        if (JSON.stringify(config) !== JSON.stringify(previousConfig)) {
            for (const guildId of Object.keys(config.tickets)) {
                const settings = config.tickets[guildId];
                const previousSettings = previousConfig.tickets[guildId];

                if (settings && settings.status && settings.ticketChannelId && (!previousSettings || settings.ticketChannelId !== previousSettings.ticketChannelId)) {
                    const guild = client.guilds.cache.get(guildId);
                    if (!guild) continue;

                    const ticketChannel = guild.channels.cache.get(settings.ticketChannelId);
                    if (!ticketChannel) continue;

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: "Welcome to Ticket Support",
                            iconURL: ticketIcons.mainIcon,
                            url: "https://discord.gg/Um8DsDEU9T"
                        })
                        .setDescription('- Please click below menu to create a new ticket.\n\n' +
                            '**Ticket Guidelines:**\n' +
                            '- Empty tickets are not permitted.\n' +
                            '- Please be patient while waiting for a response from our support team.')
                        .setFooter({ text: 'We are here to Help!', iconURL: ticketIcons.modIcon })
                        .setColor('#00FF00')
                        .setTimestamp();

                    const menu = new StringSelectMenuBuilder()
                        .setCustomId('select_ticket_type')
                        .setPlaceholder('Choose ticket type')
                        .addOptions([
                            { label: '🆘 Support', value: 'support' },
                            { label: '📂 Suggestion', value: 'suggestion' },
                            { label: '⚠️ Report', value: 'report' }
                        ]);

                    const row = new ActionRowBuilder().addComponents(menu);

                    await ticketChannel.send({
                        embeds: [embed],
                        components: [row]
                    });

                    previousConfig = JSON.parse(JSON.stringify(config));
                }
            }
        }
    }, 5000);
}

async function handleSelectMenu(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const { guild, user, values } = interaction;
    if (!guild || !user) return;

    const guildId = guild.id;
    const userId = user.id;
    const ticketType = values[0];
    const settings = config.tickets[guildId];
    if (!settings) return;

    const lastTicketTime = client.ticketCooldowns.get(userId);
    if (lastTicketTime) {
        const timePassed = Date.now() - lastTicketTime;
        const timeLeft = TICKET_COOLDOWN_DURATION - timePassed;
        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            return interaction.followUp({
                content: `You must wait before creating another ticket. Please try again in ${minutes} minute(s) and ${seconds} second(s).`,
                ephemeral: true,
            });
        }
    }

    const existingTicket = await ticketsCollection.findOne({ guildId, userId });
if (existingTicket) {
    const ticketChannel = await client.channels.fetch(existingTicket.channelId).catch(() => null);
    if (ticketChannel) {
        return interaction.followUp({ content: 'You already have an open ticket.', ephemeral: true });
    }
    // If the ticket channel does not exist, remove the ticket record
    await ticketsCollection.deleteOne({ guildId, userId });
}


    const ticketChannel = await guild.channels.create({
        name: `${user.username}-${ticketType}-ticket`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: userId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
            },
            {
                id: settings.adminRoleId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
            }
        ]
    });

    const ticketId = `${guildId}-${ticketChannel.id}`;
    await ticketsCollection.insertOne({ id: ticketId, channelId: ticketChannel.id, guildId, userId, type: ticketType });

    const ticketEmbed = new EmbedBuilder()
        .setAuthor({
            name: "Support Ticket",
            iconURL: ticketIcons.modIcon,
            url: "https://discord.gg/Um8DsDEU9T"
        })
        .setDescription(`Hello ${user}, welcome to our support!\n- Please provide a detailed description of your issue\n- Our support team will assist you as soon as possible.\n- Feel free to open another ticket if this was closed.`)
        .setFooter({ text: 'Your satisfaction is our priority', iconURL: ticketIcons.heartIcon })
        .setColor('#00FF00')
        .setTimestamp();

    const closeButton = new ButtonBuilder()
        .setCustomId(`close_ticket_${ticketId}`)
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger);

    const pingAdminsButton = new ButtonBuilder()
        .setCustomId('ping_admins')
        .setLabel('Ping Admins')
        .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(closeButton, pingAdminsButton);

    await ticketChannel.send({ content: `${user}`, embeds: [ticketEmbed], components: [actionRow] });

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({
            name: "Ticket Created!",
            iconURL: ticketIcons.correctIcon,
            url: "https://discord.gg/Um8DsDEU9T"
        })
        .setDescription(`- Your ${ticketType} ticket has been created.`)
        .addFields(
            { name: 'Ticket Channel', value: `${ticketChannel.url}` },
            { name: 'Instructions', value: 'Please describe your issue in detail.' }
        )
        .setTimestamp()
        .setFooter({ text: 'Thank you for reaching out!', iconURL: ticketIcons.modIcon });

    await user.send({ content: `Your ${ticketType} ticket has been created`, embeds: [embed] });

    client.ticketCooldowns.set(userId, Date.now());

    interaction.followUp({ content: 'Ticket created!', ephemeral: true });
}

async function handleCloseButton(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const ticketId = interaction.customId.replace('close_ticket_', '');
    const { guild, user } = interaction;
    if (!guild || !user) return;

    const ticket = await ticketsCollection.findOne({ id: ticketId });
    if (!ticket) {
        return interaction.followUp({ content: 'Ticket not found. Please report to staff!', ephemeral: true });
    }

    const ticketChannel = guild.channels.cache.get(ticket.channelId);
    if (!ticketChannel) {
        return interaction.followUp({ content: 'Ticket channel not found.', ephemeral: true });
    }

    const allMessages = await fetchAllMessages(ticketChannel);
    const humanMessages = allMessages.filter(msg => !msg.author.bot);

    const ticketCloseTime = new Date().toLocaleString('en-US', { timeZone: 'GMT' });

    let transcriptBody = 'No Transcript Found';
    if (humanMessages.length > 0) {
        transcriptBody = humanMessages
            .map((msg, index) => {
                const attachments = msg.attachments.map(att => att.name).join(', ');
                const content = msg.content || attachments || 'No content';
                return `${index + 1}. ${msg.author.tag}: ${content}`;
            })
            .join('\n');
    }
    

    const transcriptHeader = `${user.username}'s - ${ticket.type} - Transcript\n\n`;
    const transcriptFooter = '\n\nThanks for using Gido Bot!';
    const transcriptContent = transcriptHeader + transcriptBody;

    const transcriptBuffer = Buffer.from(transcriptContent, 'utf-8');
    const targetChannel = await client.channels.fetch('1277986331170963507');
    const transcriptFileName = `${ticket.username}_Transcript.txt`;

    const transcriptMessage = await targetChannel.send({
        files: [{
            attachment: transcriptBuffer,
            name: transcriptFileName
        }]
    });

    const transcriptUrl = transcriptMessage.attachments.first()?.url;

    const closedEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Ticket Closed')
        .setDescription("Hello, your ticket has been closed~\n\nClick on **Download Transcript** Button to download the transcript\n\nThanks for using Gido Bot!")
        .setTimestamp();

    const downloadButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Download Transcript')
                .setURL(transcriptUrl)
        );

    const ticketUser = await client.users.fetch(ticket.userId);
    if (ticketUser) {
        try {
            await ticketUser.send({
                content: 'Your ticket has been closed.',
                embeds: [closedEmbed],
                components: [downloadButton]
            });
        } catch (error) {
            if (error.code === 50007) {
                console.error(`Cannot send message to ${ticketUser.tag}. They may have DMs disabled or blocked the bot.`);
                await interaction.followUp({ content: 'Your ticket has been closed, but we could not send you a message. Please check your DM settings.', ephemeral: true });
            } else {
                console.error('An unexpected error occurred while sending DM:', error);
            }
        }
    }

    interaction.followUp({ content: 'Ticket closed and transcript sent.', ephemeral: true });

    setTimeout(async () => {
        await ticketChannel.delete().catch(console.error);
    }, 5000);

    await ticketsCollection.deleteOne({ id: ticketId });
}

async function fetchAllMessages(channel) {
    let allMessages = [];
    let lastMessageId;
    let fetchMore = true;

    while (fetchMore) {
        const fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
        allMessages = allMessages.concat(Array.from(fetchedMessages.values()));
        lastMessageId = fetchedMessages.last()?.id;

        if (fetchedMessages.size !== 100 || allMessages.length >= 1000000) {
            fetchMore = false;
        }
    }

    return allMessages;
}
async function getTranscriptEmbeds(channel) {
    if (!channel || channel.type !== ChannelType.GuildText) return [];

    const messages = await channel.messages.fetch({ limit: 100 });
    const humanMessages = messages.filter(msg => !msg.author.bot); // Exclude bot messages
    const messageArray = humanMessages.map(msg => `${msg.author.tag}: ${msg.content}`).reverse();

    // Create embeds, each containing up to 80 messages
    const maxMessagesPerEmbed = 80;
    const transcriptEmbeds = [];

    for (let i = 0; i < messageArray.length; i += maxMessagesPerEmbed) {
        const chunk = messageArray.slice(i, i + maxMessagesPerEmbed).join('\n');
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ticket Transcript')
            .setDescription(`\`\`\`${chunk}\`\`\``)
            .setTimestamp();

        transcriptEmbeds.push(embed);
    }

    return transcriptEmbeds;
}


async function handlePingAdminsButton(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const { guild, user } = interaction;
    if (!guild || !user) return;

    const lastPingTime = client.pingAdminCooldowns.get(user.id);
    if (lastPingTime) {
        const timePassed = Date.now() - lastPingTime;
        const timeLeft = PING_COOLDOWN_DURATION - timePassed;
        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            return interaction.followUp({ content: `You must wait before pinging admins again. Please try again in ${minutes} minute(s) and ${seconds} second(s).`, ephemeral: true });
        }
    }

    const settings = config.tickets[guild.id];
    if (!settings || !settings.adminRoleId) return;

    const adminRole = guild.roles.cache.get(settings.adminRoleId);
    if (!adminRole) return;

    const ticketChannel = interaction.channel;
    if (!ticketChannel || ticketChannel.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Admin Attention Request!')
        .setDescription(`Hey ${adminRole.toString()}, ${user} has requested your attention in the ticket channel.`)
        .setTimestamp();

    await ticketChannel.send({ content: `${adminRole}`, embeds: [embed] });

    client.pingAdminCooldowns.set(user.id, Date.now());

    interaction.followUp({ content: 'Admins have been notified.', ephemeral: true });
}

async function getTranscript(channel) {
    if (!channel || channel.type !== ChannelType.GuildText) return null;

    const messages = await channel.messages.fetch({ limit: 100 });
    const transcript = messages.map(msg => `${msg.author.tag}: ${msg.content}`).reverse().join('\n');

    return transcript;
}