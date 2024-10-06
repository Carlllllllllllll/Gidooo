const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // Function to update dynamic values
        function updateActivity() {
            const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalServers = client.guilds.cache.size;

            return [
                { name: '/help', type: ActivityType.Listening },
                { name: `${totalMembers} Members!`, type: ActivityType.Watching },
                { name: `${totalServers} Servers!`, type: ActivityType.Watching },
            ];
        }

        // Define the statuses array with only 'idle'
        const statuses = ['idle'];

        let currentActivityIndex = 0;
        let currentStatusIndex = 0;

        // Function to set bot activity and status
        function setActivityAndStatus() {
            const activities = updateActivity(); // Fetch updated activities with dynamic values
            const activity = activities[currentActivityIndex];
            const status = statuses[currentStatusIndex];

            client.user.setPresence({
                activities: [activity],
                status: status,
            });

            currentActivityIndex = (currentActivityIndex + 1) % activities.length;
            currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
        }

        // Set initial activity and status after bot is ready
        setTimeout(() => {
            setActivityAndStatus();
            console.log('\x1b[31m[ CORE ]\x1b[0m \x1b[32m%s\x1b[0m', 'Bot Activity and Status Set to Idle ✅');
        }, 2000);

        // Update activity and status every 6 seconds
        setInterval(() => {
            setActivityAndStatus();
        }, 6000);
    },
};
