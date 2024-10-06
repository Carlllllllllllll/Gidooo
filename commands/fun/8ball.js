const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option => 
            option.setName('question')
                .setDescription('The question you want to ask')
                .setRequired(true)),
    
    async execute(interaction) {
        // 50% Yes and 50% No responses, 100 total
        const responses = [
            // Yes responses (50 total)
            "🎱 Yes, absolutely!",
            "🎱 It is certain.",
            "🎱 Without a doubt.",
            "🎱 Yes, you can rely on it.",
            "🎱 Definitely yes.",
            "🎱 All signs point to yes.",
            "🎱 You got it!",
            "🎱 Most certainly yes.",
            "🎱 The outlook is good. Yes!",
            "🎱 Yes, go for it.",
            "🎱 It is decidedly so.",
            "🎱 Yes, without question.",
            "🎱 Yes, you should.",
            "🎱 Yes, indeed.",
            "🎱 Absolutely yes.",
            "🎱 Sure thing, it's a yes!",
            "🎱 The stars say yes.",
            "🎱 Yes, it's happening.",
            "🎱 Yes, the universe agrees.",
            "🎱 Yes, positively!",
            "🎱 You may rely on it.",
            "🎱 As I see it, yes.",
            "🎱 Signs point to yes.",
            "🎱 Yes, you're in luck.",
            "🎱 Without hesitation, yes.",
            "🎱 The odds say yes.",
            "🎱 Yes, for sure.",
            "🎱 Absolutely certain.",
            "🎱 Definitely yes, no doubt.",
            "🎱 Yes, it’s crystal clear.",
            "🎱 Yes, go ahead!",
            "🎱 Most assuredly yes.",
            "🎱 Yes, you're on the right track.",
            "🎱 Yes, unquestionably.",
            "🎱 Yes, it’s meant to be.",
            "🎱 Yes, all signs say yes.",
            "🎱 Yes, embrace it!",
            "🎱 Yes, trust your gut.",
            "🎱 Yes, it’s the right move.",
            "🎱 Absolutely yes, no question.",
            "🎱 The answer is yes.",
            "🎱 Yes, the time is right.",
            "🎱 Yes, go with the flow.",
            "🎱 Yes, take that leap.",
            "🎱 Yes, and it’s worth it.",
            "🎱 Yes, just as you thought.",
            "🎱 Yes, luck is on your side.",
            "🎱 Yes, success awaits.",
            "🎱 Yes, it’s a done deal.",
            "🎱 Yes, you're destined for it.",
            "🎱 Yes, you have the green light.",
            
            // No responses (50 total)
            "🎱 No, definitely not.",
            "🎱 My sources say no.",
            "🎱 Don't count on it.",
            "🎱 Outlook not so good.",
            "🎱 Very doubtful.",
            "🎱 Absolutely not.",
            "🎱 No, you shouldn’t.",
            "🎱 No, it's a bad idea.",
            "🎱 No, better avoid it.",
            "🎱 No, not a chance.",
            "🎱 The stars say no.",
            "🎱 The answer is no.",
            "🎱 No, for sure not.",
            "🎱 No, steer clear.",
            "🎱 No, rethink it.",
            "🎱 No, it’s not the time.",
            "🎱 No, it's not happening.",
            "🎱 No, you’ll regret it.",
            "🎱 No, the universe says no.",
            "🎱 Definitely not.",
            "🎱 Not in this lifetime.",
            "🎱 No, it’s not likely.",
            "🎱 No, not at all.",
            "🎱 No, move on.",
            "🎱 No, absolutely not.",
            "🎱 No, trust your instincts.",
            "🎱 No, it's not worth it.",
            "🎱 No, stop right there.",
            "🎱 No, it’s a closed door.",
            "🎱 No, all signs say no.",
            "🎱 No, the odds are against you.",
            "🎱 No, not even close.",
            "🎱 No, the answer is clear.",
            "🎱 No, it’s not a good plan.",
            "🎱 No, avoid it at all costs.",
            "🎱 No, disaster awaits.",
            "🎱 No, don’t push it.",
            "🎱 No, this is not for you.",
            "🎱 No, the risk is too high.",
            "🎱 No, you’ll hit a wall.",
            "🎱 No, let it go.",
            "🎱 No, bad timing.",
            "🎱 No, you’re better off without it.",
            "🎱 No, things won’t work out.",
            "🎱 No, you’re on the wrong path.",
            "🎱 No, this will backfire.",
            "🎱 No, reconsider.",
            "🎱 No, you’re heading for trouble.",
            "🎱 No, there’s no hope here.",
            "🎱 No, it’s not meant to be.",
        ];

        const question = interaction.options.getString('question');
        const response = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor('#1140c3')
            .setTitle('🎱 The Magic 8-Ball')
            .setDescription(`**Question:** ${question}\n**Answer:** ${response}`)
            .setTimestamp()
            .setFooter({ text: `Asked by ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    }
};
