"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var invite = {
    name: "invite",
    description: "Invite the bot to your server",
    execute: function (message, args) {
        message.channel.send("https://discord.com/api/oauth2/authorize?client_id=1005501173912051795&permissions=3409984&scope=bot");
    },
};
exports.default = invite;
