const status = 'SERVER BASED';
const botName = 'Carl';
const text = '';
const version = 'Version 1.0.0';
const startTime = Date.now();

function printWatermark() {
    const uptimeInSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\x1b[1m\x1b[36m╔════════════════════════════════════════════╗');
    console.log('\x1b[1m\x1b[36m\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20👑 GIDO BOT');
    console.log('\x1b[1m\x1b[36m\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20🚀 Powered by ' + botName + ' ');
    console.log('\x1b[1m\x1b[36m\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20👑 Authorization : ' + status + '\x20\x20\x20\x20\x20');
    console.log('\x1b[1m\x1b[36m\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20💡 Version: ' + version);
    console.log('\x1b[1m\x1b[36m\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20📅 Uptime: ' + uptimeInSeconds + 's');
    console.log('\x1b[1m\x1b[36m\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + text);
    console.log('\x1b[1m\x1b[36m╚════════════════════════════════════════════╝\x1b[0m');
}

module.exports = {
    'printWatermark': printWatermark
};
