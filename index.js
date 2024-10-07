const client = require('./main');
require('./bot');
require('./carl');

const loadEventHandlers = () => {
    console.log('\x1b[36m[ WELCOME ]\x1b[0m', '\x1b[32mWelcome System Active ✅\x1b[0m');
    const guildMemberAddHandler = require('./events/guildMemberAdd');
    guildMemberAddHandler(client);
    console.log('\x1b[36m[ TICKET ]\x1b[0m', '\x1b[32mTicket System Active ✅\x1b[0m');
    const ticketHandler = require('./events/ticketHandler');
    ticketHandler(client);
    console.log('\x1b[36m[ GIVEAWAY ]\x1b[0m', '\x1b[32mGiveaway System Active ✅\x1b[0m');
    const giveawayHandler = require('./events/giveaway');
    giveawayHandler(client);
    console.log('\x1b[36m[ AUTOROLE ]\x1b[0m', '\x1b[32mAutorole System Active ✅\x1b[0m');
    const autoroleHandler = require('./events/autorole');
    autoroleHandler(client);
    console.log('\x1b[36m[ REACTION ROLES ]\x1b[0m', '\x1b[32mReaction Roles System Active ✅\x1b[0m');
    const reactionRoleHandler = require('./events/reactionroles');
    reactionRoleHandler(client);
    const nqnHandler = require('./events/nqn');
    nqnHandler(client);
    const emojiHandler = require('./events/emojiHandler');
    console.log('\x1b[36m[ NQN Module ]\x1b[0m', '\x1b[32mEmoji System Active ✅\x1b[0m');
    emojiHandler(client);
    require('./events/music')(client);
    require('./carl');
};


loadEventHandlers();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Function to format uptime
function formatUptime() {
    let totalSeconds = Math.floor(process.uptime());
    
    const days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= 3600 * 24;
    
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let uptimeString = '';

    // Build the string but omit 0 values
    if (days > 0) uptimeString += `${days} day${days > 1 ? 's' : ''}, `;
    if (hours > 0) uptimeString += `${hours} hour${hours > 1 ? 's' : ''}, `;
    if (minutes > 0) uptimeString += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
    uptimeString += `${seconds} second${seconds > 1 ? 's' : ''}`;

    // Remove the last comma and space if present
    uptimeString = uptimeString.replace(/,\s*$/, '');

    return uptimeString;
}

// API endpoint to get bot uptime
app.get('/uptime', (req, res) => {
    res.json({ uptime: formatUptime() });
});

app.listen(PORT, () => {
    console.log(`Server running at https://gido-v2-i8wm.onrender.com`);
});


loadEventHandlers();
