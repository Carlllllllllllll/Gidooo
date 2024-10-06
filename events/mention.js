const { Events, EmbedBuilder, Collection } = require('discord.js');
const cooldowns = new Collection();

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;

        const now = Date.now();
        const cooldownAmount = 10 * 60 * 1000;
        const userCooldown = `${message.author.id}_${message.guild.id}`;

        if (cooldowns.has(userCooldown)) {
            const expirationTime = cooldowns.get(userCooldown) + cooldownAmount;
            if (now < expirationTime) return;
        }

        cooldowns.set(userCooldown, now);

        if (message.mentions.has(message.client.user)) {
            const embed = new EmbedBuilder()
                .setTitle('Hello!')
                .setDescription('Do you need help? No worries! Type `/help` for assistance.')
                .setColor('#00FF00')
                .setFooter({ text: 'Gido Bot' });

            message.reply({ embeds: [embed] }).catch(console.error);
        }
    },
};
