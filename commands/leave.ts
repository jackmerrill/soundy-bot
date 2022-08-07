import { getVoiceConnection } from "@discordjs/voice";
import { Message } from "discord.js";

const leave = {
  name: "leave",
  description: "Leave the current voice channel",
  execute(message: Message, args: string[]) {
    if (!message.member) return;

    if (!message.member.voice.channel)
      return message.channel.send("You are not in a voice channel");
    if (!message.guild) return;

    message.reply("You can't escape :)");

    // getVoiceConnection(message.guild.id)?.destroy();
    // message.react("👍");
  },
};

export default leave;
