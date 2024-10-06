const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription(lang.warnDescription)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('senddm')
                .setDescription('Send a DM to the user being warned')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        try {
            const sender = interaction.user; 
            const targetUser = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason');
            const sendDM = interaction.options.getBoolean('senddm');

            // Check if the target user is undefined
            if (!targetUser) {
                return interaction.reply({ 
                    content: `Target user not found! ⚠️`, 
                    ephemeral: true 
                });
            }

            // Check if the target user is a bot
            if (targetUser.bot) {
                return interaction.reply({ 
                    content: `You cannot warn a bot! ⚠️`, 
                    ephemeral: true 
                });
            }

            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({ 
                    content: `You do not have permission to warn members! ⚠️`, 
                    ephemeral: true 
                });
            }

            // Check if the user is trying to warn themselves
            if (sender.id === targetUser.id) {
                return interaction.reply({ 
                    content: `You cannot warn yourself! ⚠️`, 
                    ephemeral: true 
                });
            }

            const mentionMessage = `**${targetUser}, you have been warned!**`;
            
            const embed = new EmbedBuilder()
                .setTitle('🚨 User Warned 🚨')
                .setDescription(`**<@${targetUser.id}>** has been warned by **<@${sender.id}>**!`)
                .addFields(
                    { name: 'Reason', value: `📜 ${reason}`, inline: false },
                    { name: 'Date', value: `🗓️ <t:${Math.floor(Date.now() / 1000)}>`, inline: false }
                )
                .setColor(0xffcc00);

            await interaction.reply({ content: mentionMessage, embeds: [embed] });

            if (sendDM) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔔 You have been warned! 🔔')
                    .setDescription(`Hello **<@${targetUser.id}>**, you have been warned by **<@${sender.id}>**`)
                    .addFields(
                        { name: 'Reason', value: `📜 ${reason}`, inline: false },
                        { name: 'Date', value: `🗓️ <t:${Math.floor(Date.now() / 1000)}>`, inline: false }
                    )
                    .setColor(0xff0000)
                    .setFooter({ text: `Action taken in ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() });

                await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
                    // Handle case if the user has DMs disabled
                    interaction.followUp({ content: 'Failed to send DM, user has DMs disabled.', ephemeral: true });
                });
            }
        } catch (error) {


            // Send an error embed to the user in case of an unidentified error
            const errorEmbed = new EmbedBuilder()
            .setColor('#1140c3')
            .setAuthor({
                name: 'Alert!',
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/Um8DsDEU9T"
            })
            .setDescription('- This command can only be used through slash command!\n- Please use `/warn` to warn a user.')
            .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    async handleMessageCommand(message) {
        try {
            if (message.content.startsWith('!warn')) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setAuthor({ 
                        name: "Alert!", 
                        iconURL: "https://cdn.discordapp.com/embed/avatars/0.png",
                    })
                    .setDescription('- This command can only be used through slash command!\n- Please use `/warn`') 
                    .setTimestamp();
                
                return message.reply({ embeds: [embed] });
            }

            const targetUser = message.mentions.users.first();

            // Check if the target user is undefined
            if (!targetUser) {
                return message.reply({ 
                    content: `You need to mention a user to warn! ⚠️`, 
                    ephemeral: true 
                });
            }

            // Check if the target user is a bot
            if (targetUser.bot) {
                return message.reply({ 
                    content: `You cannot warn a bot! ⚠️`, 
                    ephemeral: true 
                });
            }

            const args = message.content.split(' ').slice(1);
            const reasonIndex = args.indexOf(':');

            // Validate arguments
            if (reasonIndex === -1 || reasonIndex === args.length - 1) {
                return message.reply({ 
                    content: `Please provide a valid reason! ⚠️`, 
                    ephemeral: true 
                });
            }

            const sendDM = args[args.length - 1] === 'true';
            const reason = args.slice(reasonIndex + 1, sendDM ? -1 : undefined).join(' ');

            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return message.reply({ 
                    content: `${message.author}, you do not have permission to warn members! ⚠️`, 
                    ephemeral: true 
                });
            }

            // Check if the user is trying to warn themselves
            if (message.author.id === targetUser.id) {
                return message.reply({ 
                    content: `You cannot warn yourself! ⚠️`, 
                    ephemeral: true 
                });
            }

            const mentionMessage = `**${targetUser}, you have been warned!**`;
            
            const embed = new EmbedBuilder()
                .setTitle('🚨 User Warned 🚨')
                .setDescription(`**${targetUser}** has been warned by **${message.author}**!`)
                .addFields(
                    { name: 'Reason', value: `📜 ${reason}`, inline: false },
                    { name: 'Date', value: `🗓️ <t:${Math.floor(Date.now() / 1000)}>`, inline: false }
                )
                .setColor(0xffcc00);

            await message.channel.send({ content: mentionMessage, embeds: [embed] });

            if (sendDM) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔔 You have been warned! 🔔')
                    .setDescription(`Hello **${targetUser.tag}**, you have been warned by **${message.author.tag}** in **${message.guild.name}**.`)
                    .addFields(
                        { name: 'Reason', value: `📜 ${reason}`, inline: false },
                        { name: 'Date', value: `🗓️ <t:${Math.floor(Date.now() / 1000)}>`, inline: false }
                    )
                    .setColor(0xff0000)
                    .setFooter({ text: `Action taken in ${message.guild.name}`, iconURL: message.guild.iconURL() });

                await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
                    // Handle case if the user has DMs disabled
                    message.channel.send('Failed to send DM, user has DMs disabled.');
                });
            }
        } catch (error) {


            const errorEmbed = new EmbedBuilder()
            embed = new EmbedBuilder()
            .setColor('#1140c3')
            .setAuthor({
                name: lang.mpauseAlert || 'Alert!',
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/Um8DsDEU9T"
            })
            .setDescription('- This command can only be used through slash command!\n- Please use `/warn` to warn a user.')
            .setTimestamp();

            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};
