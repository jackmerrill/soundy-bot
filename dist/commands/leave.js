"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var leave = {
    name: "leave",
    description: "Leave the current voice channel",
    execute: function (message, args) {
        if (!message.member)
            return;
        if (!message.member.voice.channel)
            return message.channel.send("You are not in a voice channel");
        if (!message.guild)
            return;
        message.reply("You can't escape :)");
        // getVoiceConnection(message.guild.id)?.destroy();
        // message.react("👍");
    },
};
exports.default = leave;
