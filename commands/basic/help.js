const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const { serverConfigCollection } = require('../../mongodb');
const commandFolders = ['anime', 'basic', 'fun', 'moderation', 'utility', 'lavalink', 'setups'];
const enabledCategories = config.categories;
const excessCommands = config.excessCommands;
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of commands'),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {

            const serverId = interaction.guildId;
            let serverConfig;
            try {
                serverConfig = await serverConfigCollection.findOne({ serverId });
            } catch (err) {
                console.error('Error fetching server configuration from MongoDB:', err);
            }

          
            const serverPrefix = serverConfig && serverConfig.prefix ? serverConfig.prefix : config.prefix;

            const createSlashCommandPages = () => {
                const pages = [];

                const totalServers = interaction.client.guilds.cache.size;
                const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                const uptime = process.uptime();
                const uptimeHours = Math.floor(uptime / 3600);
                const uptimeMinutes = Math.floor((uptime % 3600) / 60);
                const uptimeSeconds = Math.floor(uptime % 60);

                const enabledCategoriesList = Object.keys(enabledCategories).filter(category => enabledCategories[category]);
                const disabledCategoriesList = Object.keys(enabledCategories).filter(category => !enabledCategories[category]);

                
                const countJsFiles = (dir) => {
                    try {
                        if (fs.existsSync(dir)) {
                            return fs.readdirSync(dir).filter(file => file.endsWith('.js')).length;
                        }
                        return 0;
                    } catch (err) {
                        console.error(`Error reading directory ${dir}:`, err);
                        return 0;
                    }
                };
                
             
                const getDirectories = (src) => {
                    return fs.readdirSync(src).filter(file => fs.statSync(path.join(src, file)).isDirectory());
                };
                
              
                const commandsDir = path.join(__dirname, '../../commands');
                const excessCommandsDir = path.join(__dirname, '../../excesscommands');
                
             
                const commandFolders = getDirectories(commandsDir);
                const totalCommandFiles = commandFolders.reduce((total, folder) => {
                    const folderPath = path.join(commandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
           
                const excessCommandFolders = getDirectories(excessCommandsDir);
                const totalExcessCommandFiles = excessCommandFolders.reduce((total, folder) => {
                    const folderPath = path.join(excessCommandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
            
                const totalCommands = totalCommandFiles + totalExcessCommandFiles;
                

                pages.push({
                    title: 'Bot Information',
                    description: `Welcome to the help command! This bot provides a variety of commands to enhance your server experience. Below are the categories and the number of commands available in each.`,
                    commands: [
                        `**Bot Developer:** Carl\n`+
                        `**Bot Version:** 2.0.0\n`+
                        `**Bot Uptime:** ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n`+
                        `**Total Commands:** ${totalCommands}\n`+
                        `**Gido Web:** [Press Here](https://gido-web.ooguy.com)\n`+
                        `**Support Server** [Press Here!](https://discord.gg/Gq48UpPrXH)\n`,
                    ],
                    image: "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=",
                    color: "#1140c3",
                    thumbnail: "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424",
                    author: {
                        name: 'GIDO BOT',
                        iconURL: "https://media.discordapp.net/attachments/1272578222164541460/1274799952421457940/Gido-PFP-Carl.gif?ex=66c39179&is=66c23ff9&hm=c7e387f1e72f6a7bdd0e04edcca41adf7f19e1f93f50d3e4d0692add981c07c2&=",
                        url: "https://discord.gg/Gq48UpPrXH"
                    }
                });

                const commandData = {};

                for (const folder of commandFolders) {

                    if (enabledCategories[folder]) { 
                        const commandFiles = fs.readdirSync(path.join(__dirname, `../../commands/${folder}`)).filter(file => file.endsWith('.js'));
                        commandData[folder] = commandFiles.map(file => {
                            const command = require(`../../commands/${folder}/${file}`);
                            return command.data.name;
                        });
                    }
                }

                for (const [category, commands] of Object.entries(commandData)) {
                    const page = {
                        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                        description: `**Total Commands : **${commands.length}\n` +
                            `**Usage : **Slash commands \n\n` +
                            `${category.charAt(0).toUpperCase() + category.slice(1)} related commands`,
                        commands: commands.map(command => `\`\`${command}\`\``),
                        image: "",
                        color: "#1140c3",
                        thumbnail: "",
                        author: {
                            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                            iconURL: "",
                            url: "https://discord.gg/Gq48UpPrXH"
                        }
                    };

                    switch (category) {
                        case 'anime':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#14c311";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/BHj1iodxNJ9cdVvFdPKdUnh2KR9qL37sAdQs0oxtRyY/https/media1.tenor.com/m/BuOEFiBqHdUAAAAC/anime-naruto.gif";
                            break;
                        case 'basic':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1230824451990622299/1253655047259160596/6186-developer-bot.gif?ex=66a9667f&is=66a814ff&hm=1494b63ccfaf2dae30a35af520fb748dd17e76195c206f2925b526595018c60f&";
                            break;
                        case 'fun':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/ShqvwHB2ck83NdYmDLO7l9bHLPX-B51pNwdO7YpW13g/https/www.clipartbest.com/cliparts/pT5/ABj/pT5ABjqTB.gif?width=424&height=424";
                            break;
                        case 'moderation':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/hLYKVW5BkmBExr8bWY_MtFlxz8KqrHAjVYB6ElbShns/%3Frik%3DHdheShCAUkEV3Q%26pid%3DImgRaw%26r%3D0/https/th.bing.com/th/id/R.ddd4c51a719eb9a9da52a9c8612ccbbb?format=webp";
                            break;
                        case 'utility':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/Yy8eZeGgZdHtLsaalUHGNlaN_LuStptZdWY6fMvZn_k/https/cdn-icons-png.flaticon.com/512/6900/6900676.png?format=webp&quality=lossless&width=424&height=424";
                            break;
                            case 'lavalink':
                                page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                                page.color = "#1140c3";
                                page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                                page.author.iconURL = "https://images-ext-1.discordapp.net/external/6YLBvK4_g31a78wc_tXjo07O8tilGSZ4PmHhWDWmbrE/https/avatars.githubusercontent.com/u/133400169?format=webp&width=300&height=300";
                                break;
                        case 'setups':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/6Kl2cXzhKWYOve6_vQsk2YyUmwqQ3wTxyAwE0UE-N_Q/%3Frik%3DfqpHW2UjZ%252bjuBQ%26riu%3Dhttp%253a%252f%252fcdn.onlinewebfonts.com%252fsvg%252fimg_452183.png%26ehk%3DX4wXsoOheajHnDtybuWV%252bOGso8I14oTEB2N1iONizDE%253d%26risl%3D%26pid%3DImgRaw%26r%3D0/https/th.bing.com/th/id/R.da2fef7e2b315828624307de6ee1d856?format=webp&width=417&height=424";
                            break;
                        default:
                            page.color = "#1140c3"; // Set a default color if none matches
                            break;
                    }

                    pages.push(page);
                }

                return pages;
            };

            const createPrefixCommandPages = () => {

                const pages = [];
                const totalServers = interaction.client.guilds.cache.size;
                const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                const uptime = process.uptime();
                const uptimeHours = Math.floor(uptime / 3600);
                const uptimeMinutes = Math.floor((uptime % 3600) / 60);
                const uptimeSeconds = Math.floor(uptime % 60);

                const enabledCategoriesList = Object.keys(enabledCategories).filter(category => enabledCategories[category]);
                const disabledCategoriesList = Object.keys(enabledCategories).filter(category => !enabledCategories[category]);

                
                const countJsFiles = (dir) => {
                    try {
                        if (fs.existsSync(dir)) {
                            return fs.readdirSync(dir).filter(file => file.endsWith('.js')).length;
                        }
                        return 0;
                    } catch (err) {
                        console.error(`Error reading directory ${dir}:`, err);
                        return 0;
                    }
                };
                
             
                const getDirectories = (src) => {
                    return fs.readdirSync(src).filter(file => fs.statSync(path.join(src, file)).isDirectory());
                };
                
              
                const commandsDir = path.join(__dirname, '../../commands');
                const excessCommandsDir = path.join(__dirname, '../../excesscommands');
                
             
                const commandFolders = getDirectories(commandsDir);
                const totalCommandFiles = commandFolders.reduce((total, folder) => {
                    const folderPath = path.join(commandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
           
                const excessCommandFolders = getDirectories(excessCommandsDir);
                const totalExcessCommandFiles = excessCommandFolders.reduce((total, folder) => {
                    const folderPath = path.join(excessCommandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
            
                const totalCommands = totalCommandFiles + totalExcessCommandFiles;
                pages.push({
                    title: 'Bot Information',
                    description: `Welcome to the help command! This bot provides a variety of commands to enhance your server experience. Below are the categories and the number of commands available in each.`,
                    commands: [
                        `**Bot Developer:** Carl\n`+
                        `**Bot Version:** 2.0.0\n`+
                        `**Bot Uptime:** ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n`+
                        `**Total Commands:** ${totalCommands}\n`+
                        `**Gido Web:** [Press Here](https://gido-web.ooguy.com)\n`+
                        `**Support Server** [Press Here!](https://discord.gg/Gq48UpPrXH)\n`,
                    ],
                    image: "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=",
                    color: "#1140c3",
                    thumbnail: "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424",
                    author: {
                        name: 'GIDO BOT',
                        iconURL: "https://media.discordapp.net/attachments/1272578222164541460/1274799952421457940/Gido-PFP-Carl.gif?ex=66c39179&is=66c23ff9&hm=c7e387f1e72f6a7bdd0e04edcca41adf7f19e1f93f50d3e4d0692add981c07c2&=",
                        url: "https://discord.gg/Gq48UpPrXH"
                    }
                });

                const prefixCommands = {};

                for (const [category, isEnabled] of Object.entries(excessCommands)) {
                    if (isEnabled) {
                        const commandFiles = fs.readdirSync(path.join(__dirname, `../../excesscommands/${category}`)).filter(file => file.endsWith('.js'));
                        prefixCommands[category] = commandFiles.map(file => {
                            const command = require(`../../excesscommands/${category}/${file}`);
                            return {
                                name: command.name,
                                description: command.description
                            };
                        });
                    }
                }

                for (const [category, commands] of Object.entries(prefixCommands)) {
                    const page = {
                        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                        description: `**Total Commands : **${commands.length}\n` +
                            `**Usage : **Only Prefix commands with \`${serverPrefix}\`\n\n` +
                            `${category.charAt(0).toUpperCase() + category.slice(1)} related commands`,
                        commands: commands.map(command => `\`\`${command.name}\`\``),
                        image: "",
                        color: "",
                        thumbnail: "",
                        author: {
                            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                            iconURL: "",
                            url: "https://discord.gg/Gq48UpPrXH"
                        }
                    };

                    switch (category) {
                        case 'utility':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/Yy8eZeGgZdHtLsaalUHGNlaN_LuStptZdWY6fMvZn_k/https/cdn-icons-png.flaticon.com/512/6900/6900676.png?format=webp&quality=lossless&width=424&height=424";
                            break;
                        case 'other':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/UhTasedwkB1RHFZtnKv3GL3GPd1Z8TReBrafcLK2fhw/%3Frik%3DPCkLdU2KeNrhyw%26pid%3DImgRaw%26r%3D0/https/th.bing.com/th/id/R.b48601cdc1201f11484495fbea846d0d?format=webp&width=424&height=424";
                            break;
                        case 'hentai':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/Yi_fnNyMhwO_vFBz9e-b8wLQWTQ_3QWxJOkhMpIeze8/%3Frs%3D1%26pid%3DImgDetMain/https/th.bing.com/th/id/OIP.iJMtptOXkW0Zv912BlEE9QHaHa?format=webp&width=424&height=424";
                            break;
                        case 'troll':
                            page.image = "https://media.discordapp.net/attachments/1272578222164541460/1274798703995125942/Gido-Help-Carl.gif?ex=66c3904f&is=66c23ecf&hm=bd135c1f7a19cb6d5bfa65c26bbdcf53807e620eb48229677b97d15c62ce2cf1&=";
                            page.color = "#1140c3";
                            page.thumbnail = "https://media.discordapp.net/attachments/1272578222164541460/1274797593926565920/GIDO-BOT-LOGO-CARL.png?ex=66c38f46&is=66c23dc6&hm=90c781b45fe22e5196178fd9c3144111203615a2759f520aaf6d710084b45e99&=&format=webp&quality=lossless&width=424&height=424";
                            page.author.iconURL = "https://images-ext-1.discordapp.net/external/0swlhenhvd5uot6SvR5nP1Q-ywnMKmgXTf9wTmgwFIM/https/media.tenor.com/RxssYTNBBRAAAAAM/trollface-troll.gif";
                            break;
                        default:
                            page.color = "#1140c3"; // Set a default color if none matches
                            break;
                    }

                    pages.push(page);
                }

                return pages;
            };

            const slashCommandPages = createSlashCommandPages();
            const prefixCommandPages = createPrefixCommandPages();
            let currentPage = 0;
            let isPrefixHelp = false;

            const createEmbed = () => {
                const pages = isPrefixHelp ? prefixCommandPages : slashCommandPages;
                const page = pages[currentPage];

                if (!page) {
                    console.error('Page is undefined');
                    return new EmbedBuilder().setColor('#3498db').setTitle('Error').setDescription('Page not found.');
                }

                const fieldName = page.title === "Bot Information" ? "Additional Information" : "Commands";

                // Ensure a valid color is always set
                const color = page.color || '#14c311';

                return new EmbedBuilder()
                    .setTitle(page.title)
                    .setDescription(page.description)
                    .setColor(color)
                    .setImage(page.image)
                    .setThumbnail(page.thumbnail)
                    .setAuthor({ name: page.author.name, iconURL: page.author.iconURL, url: page.author.url })
                    .addFields({ name: fieldName, value: page.commands.join(', ') });
            };

            const createActionRow = () => {
                const pages = isPrefixHelp ? prefixCommandPages : slashCommandPages;
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous1')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next2')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === pages.length - 1),
                        new ButtonBuilder()
                            .setCustomId('prefix')
                            .setLabel(isPrefixHelp ? 'Normal Command List' : 'Excess Command List')
                            .setStyle(ButtonStyle.Secondary)
                    );
            };

            const createDropdown = () => {
                const pages = isPrefixHelp ? prefixCommandPages : slashCommandPages;
                return new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('page-select')
                            .setPlaceholder('Select a page')
                            .addOptions(pages.map((page, index) => ({
                                label: page.title,
                                value: index.toString()
                            })))
                    );
            };

            await interaction.reply({ embeds: [createEmbed()], components: [createDropdown(), createActionRow()] });

            const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (button) => {
                if (button.user.id !== interaction.user.id) return;

                if (button.isButton()) {
                    if (button.customId === 'previous1') {
                        currentPage = (currentPage - 1 + (isPrefixHelp ? prefixCommandPages : slashCommandPages).length) % (isPrefixHelp ? prefixCommandPages : slashCommandPages).length;
                    } else if (button.customId === 'next2') {
                        currentPage = (currentPage + 1) % (isPrefixHelp ? prefixCommandPages : slashCommandPages).length;
                    } else if (button.customId === 'prefix') {
                        isPrefixHelp = !isPrefixHelp;
                        currentPage = 0;
                    }
                } else if (button.isSelectMenu()) {
                    currentPage = parseInt(button.values[0]);
                }

                try {
                    await button.update({ embeds: [createEmbed()], components: [createDropdown(), createActionRow()] });
                } catch (error) {
                    console.error('Error updating the interaction:', error);
                }
            });

            collector.on('end', async () => {
                try {
                    await interaction.editReply({ components: [] });
                } catch (error) {
                    console.error('Error editing the interaction reply:', error);
                }
            });
           }   else {
                const embed = new EmbedBuilder()
                .setColor('#1140c3')
                .setAuthor({ 
                    name: "Alert!", 
                    iconURL: cmdIcons.dotIcon ,
                    url: "https://discord.gg/Gq48UpPrXH"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/help`')
                .setTimestamp();
            
                await interaction.reply({ embeds: [embed] });
            
                } 
    }
};