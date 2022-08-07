import { Message } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { playRandomAudio } from "../bot";

const join = {
  name: "join",
  description: "Join the voice channel you are in",
  execute(message: Message, args: string[]) {
    if (!message.member) return;

    if (!message.member.voice.channel)
      return message.channel.send("You are not in a voice channel");
    if (!message.guild) return;

    joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    message.react("👍");
  },
};

export default join;
