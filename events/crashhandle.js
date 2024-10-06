require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Function to log messages to the webhook
const logToWebhook = async (message) => {
    const { default: fetch } = await import('node-fetch'); // Use dynamic import
    const payload = {
        content: message,
    };
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
};

// Function to monitor memory usage
const monitorMemory = () => {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
        const usedMemory = memoryUsage.heapUsed + memoryUsage.external;
        const memoryThreshold = 450 * 1024 * 1024; // Set to 450MB

        if (usedMemory > memoryThreshold) {
            logToWebhook(`Memory usage high: ${(usedMemory / 1024 / 1024).toFixed(2)} MB`);
            // Optionally perform cleanup or restart logic here
        }
    }, 60000); // Check every minute
};

// Log unhandled promise rejections
process.on('unhandledRejection', async (reason) => {
    await logToWebhook(`Unhandled Rejection: ${reason}`);
});

// Log uncaught exceptions
process.on('uncaughtException', async (error) => {
    await logToWebhook(`Uncaught Exception: ${error.message}\nStack: ${error.stack}`);
    process.exit(1); // Exit the process to restart it
});

// Log Discord client error events
client.on('error', async (error) => {
    await logToWebhook(`Discord Client Error: ${error.message}\nStack: ${error.stack}`);
});

// Log message errors
client.on('messageCreate', async (message) => {
    try {
        // Your message processing logic here
    } catch (error) {
        await logToWebhook(`Message Error: ${error.message}\nStack: ${error.stack}`);
    }
});

// Log event errors
client.on('interactionCreate', async (interaction) => {
    try {
        // Your interaction processing logic here
    } catch (error) {
        await logToWebhook(`Interaction Error: ${error.message}\nStack: ${error.stack}`);
    }
});

// Log when the bot is ready
client.once('ready', () => {
    monitorMemory(); // Start memory monitoring
});

// Log in the bot
client.login(process.env.TOKEN);
