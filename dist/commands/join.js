"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var voice_1 = require("@discordjs/voice");
var join = {
    name: "join",
    description: "Join the voice channel you are in",
    execute: function (message, args) {
        if (!message.member)
            return;
        if (!message.member.voice.channel)
            return message.channel.send("You are not in a voice channel");
        if (!message.guild)
            return;
        voice_1.joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: true,
        });
        message.react("👍");
    },
};
exports.default = join;
