import { Message } from "discord.js";

const invite = {
  name: "invite",
  description: "Invite the bot to your server",
  execute(message: Message, args: string[]) {
    message.channel.send(
      "https://discord.com/api/oauth2/authorize?client_id=1005501173912051795&permissions=3409984&scope=bot"
    );
  },
};

export default invite;
