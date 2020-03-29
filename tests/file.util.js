const Discord = require('discord.js');
const fs = require('fs');
let arr = new Discord.Collection();

module.exports = {
    getCommand: async function getCommand(cmd) {
        for (let i in commandNames) {
            if (myCommands.get(commandNames[i]).name === cmd)
                return myCommands.get(commandNames[i]);
        }
        return false;
    },

    commandFiles: fs.readdirSync('commands').filter(file => file.endsWith('.js')),

    MockDiscord: class MockDiscord {
        constructor() {
            this.mockClient();
            this.mockGuild();
            this.mockChannel();
            this.mockGuildChannel();
            this.mockTextChannel();
            this.mockUser();
            this.mockGuildMember();
            this.guild.members.set(this.guildMember.id, this.guildMember);
            this.mockMessage();
        }

        getClient() {
            return this.client;
        }

        getGuild() {
            return this.guild;
        }

        getChannel() {
            return this.channel;
        }

        getGuildChannel() {
            return this.guildChannel;
        }

        getTextChannel() {
            return this.textChannel;
        }

        getUser() {
            return this.user;
        }

        getGuildMember() {
            return this.guildMember;
        }

        getMessage() {
            return this.message;
        }

        mockClient() {
            this.client = new Discord.Client();
        }

        mockGuild() {
            this.guild = new Discord.Guild(this.client, {
                unavailable: false,
                id: 'guild-id',
                name: 'mocked discord.js guild',
                icon: 'mocked guild icon url',
                splash: 'mocked guild splash url',
                region: 'eu-west',
                member_count: 42,
                large: false,
                features: [],
                application_id: 'application-id',
                afkTimeout: 1000,
                afk_channel_id: 'afk-channel-id',
                system_channel_id: 'system-channel-id',
                embed_enabled: true,
                verification_level: 2,
                explicit_content_filter: 3,
                mfa_level: 8,
                joined_at: new Date('2018-01-01').getTime(),
                owner_id: 'owner-id',
                channels: [],
                roles: [],
                presences: [],
                voice_states: [],
                emojis: [],
            });
        }

        mockChannel() {
            this.channel = new Discord.Channel(this.client, {
                id: 'channel-id',
            });
        }

        mockGuildChannel() {
            this.guildChannel = new Discord.GuildChannel(this.guild, Object.assign(Object.assign({}, this.channel), {
                name: 'guild-channel',
                position: 1,
                parent_id: '123456789',
                permission_overwrites: []
            }));
        }

        mockTextChannel() {
            this.textChannel = new Discord.TextChannel(this.guild, Object.assign(Object.assign({}, this.guildChannel), {
                topic: 'topic',
                nsfw: false,
                last_message_id: '123456789',
                lastPinTimestamp: new Date('2019-01-01').getTime(),
                rate_limit_per_user: 0
            }));
        }

        mockUser() {
            this.user = new Discord.User(this.client, {
                id: 'user-id',
                username: 'user username',
                discriminator: 'user#0000',
                avatar: 'user avatar url',
                bot: false,
            });
        }

        mockGuildMember() {
            this.guildMember = new Discord.GuildMember(this.guild, {
                deaf: false,
                mute: false,
                self_mute: false,
                self_deaf: false,
                session_id: 'session-id',
                channel_id: 'channel-id',
                nick: 'nick',
                joined_at: new Date('2020-01-01').getTime(),
                user: this.user,
                roles: [],
            });
        }

        mockMessage() {
            this.message = new Discord.Message(this.textChannel, {
                id: 'message-id',
                type: 'DEFAULT',
                content: 'this is the message content',
                author: this.user,
                webhook_id: null,
                member: this.guildMember,
                pinned: false,
                tts: false,
                nonce: 'nonce',
                embeds: [],
                attachments: [],
                edited_timestamp: null,
                reactions: [],
                mentions: [],
                mention_roles: [],
                mention_everyone: [],
                hit: false,
            }, this.client);
        }
    }

};

for (const file of module.exports.commandFiles) {
    const command = require(`./../commands/${file}`);
    arr.set(command.name, command);
}

const myCommands = arr;
const commandNames = myCommands.keyArray();

// This is me testing dw about it
// module.exports.getCommand('ping').then(res => {
//     console.log(`Result: ${res.name}`);
//     // res.execute() would normally run the function
// });
