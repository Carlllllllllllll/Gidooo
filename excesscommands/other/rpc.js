const { EmbedBuilder } = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
    name: 'rpc',
    description: lang.rpcDescription,
    execute(message, args) {
        const choices = ['rock', 'paper', 'scissors'];
        const userChoice = args[0]?.toLowerCase();

        if (!choices.includes(userChoice)) {
            return message.reply(lang.rpcInvalidChoice);
        }

        const randomIndex = Math.floor(Math.random() * choices.length);
        const randomChoice = choices[randomIndex];

        let result;
        if (userChoice === randomChoice) {
            result = lang.rpcResultDraw;
        } else if (
            (userChoice === 'rock' && randomChoice === 'scissors') ||
            (userChoice === 'paper' && randomChoice === 'rock') ||
            (userChoice === 'scissors' && randomChoice === 'paper')
        ) {
            result = lang.rpcResultWin;
        } else {
            result = lang.rpcResultLose;
        }

        const embed = new EmbedBuilder()
            .setTitle(lang.rpcTitle)
            .setDescription(`${lang.rpcBotChoice} **${randomChoice}**! ${result}`)
            .setColor('#1140c3');

        message.reply({ embeds: [embed] });
    },
};
