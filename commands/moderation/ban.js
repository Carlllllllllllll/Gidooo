const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription(lang.banCommandDescription)
        .addUserOption(option =>
            option.setName('target')
                .setDescription(lang.banTargetDescription)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) { 
            if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setDescription(lang.banNoPermission);
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const target = interaction.options.getUser('target');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member.bannable) {
                const embed = new EmbedBuilder()
                    .setColor('#1140c3')
                    .setDescription(lang.banCannotBan.replace('${target.tag}', target.tag));
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            await member.ban();
            const embed = new EmbedBuilder()
                .setColor('#1140c3')
                .setDescription(lang.banSuccess.replace('${target.tag}', target.tag));
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({ 
                    name: lang.banAlert, 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/Um8DsDEU9T"
                })
                .setDescription(lang.banOnlySlashCommand)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }   
    },
};
