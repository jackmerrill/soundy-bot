import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  getVoiceConnections,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import { Client } from "discord.js";
import { config } from "dotenv";
import { existsSync, readdirSync, writeFileSync } from "fs";
import { Server } from "socket.io";
import ytdl from "ytdl-core";
import sounds from "./sounds.json";
import ms from "ms";

export function playRandomAudio() {
  const conns = getVoiceConnections();

  const sound = sounds.sounds[Math.floor(Math.random() * sounds.sounds.length)];

  if (!sound) return;

  const audioResource = createAudioResource(
    ytdl(sound, { filter: "audioonly" })
  );

  const audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  audioPlayer.play(audioResource);
  client.user?.setActivity(sound);
  conns.forEach((conn) => {
    const sub = conn.subscribe(audioPlayer);
  });
}

export function playAudio(sound: string) {
  const conns = getVoiceConnections();

  const audioResource = createAudioResource(
    ytdl(sound, { filter: "audioonly" })
  );

  const audioPlayer = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  audioPlayer.play(audioResource);
  client.user?.setActivity(sound);
  conns.forEach((conn) => {
    const sub = conn.subscribe(audioPlayer);
  });

  audioPlayer.on(AudioPlayerStatus.Idle, () => {
    audioPlayer.stop(true);
  });
}

config();

const client = new Client({
  intents: ["GuildMessages", "Guilds", "MessageContent", "GuildVoiceStates"],
});

const PREFIX = "s.";

client.on("ready", (c) => {
  console.log(`Logged in as ${client.user?.tag}`);

  // pick a random number between 2 and 10
  let random = Math.floor(Math.random() * (10 - 2 + 1)) + 2;

  const sound = () => {
    playRandomAudio();
    random = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    console.log("Playing next sound in " + random + " minutes");
    client.user?.setActivity("⏱");
    setTimeout(sound, ms(random + "m"));
  };

  client.user?.setActivity("⏱");

  console.log("Playing first sound in " + random + " minutes");
  setTimeout(sound, ms(random + "m"));
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).split(/ +/);
  const command = args.shift()?.toLowerCase();

  // check if command exists
  if (!existsSync(`./commands/${command}.ts`)) {
    return;
  }

  const { default: commandFile } = require(`./commands/${command}`);
  commandFile.execute(message, args);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  if (oldState.channelId === newState.channelId) return;
  if (!newState.channelId) {
    getVoiceConnection(newState.guild.id)?.destroy();
    return;
  }

  joinVoiceChannel({
    channelId: newState.channelId,
    guildId: newState.guild.id,
    adapterCreator: newState.guild.voiceAdapterCreator,
    selfDeaf: true,
  });
});

const io = new Server({
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
});

io.on("connection", (socket) => {
  socket.on("playSound", (sound: string) => {
    playAudio(sound);
  });

  socket.on("createSound", (youtubeLink: string) => {
    // @ts-ignore
    sounds.sounds.push(youtubeLink);

    writeFileSync("./sounds.json", JSON.stringify(sounds, null, 2));

    socket.emit("update", sounds);
  });

  socket.on("deleteSound", (sound: string, callback) => {
    // @ts-ignore
    sounds.sounds.splice(sounds.sounds.indexOf(sound), 1);

    writeFileSync("./sounds.json", JSON.stringify(sounds, null, 2));

    callback(sounds.sounds);
  });

  socket.on("listSounds", (callback) => {
    callback(sounds.sounds);
  });
});

io.listen(6969);

client.login(process.env.BOT_TOKEN).catch(console.error);
