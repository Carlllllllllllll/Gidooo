const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(lang.pingDescription),
    async execute(interaction) {
        const botLatency = Date.now() - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#1140c3')
            .setTitle(lang.pingTitle)
            .setDescription(`${lang.botLatency}: ${botLatency}ms\n${lang.apiLatency}: ${apiLatency}ms`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
