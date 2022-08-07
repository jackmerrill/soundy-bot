"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playAudio = exports.playRandomAudio = void 0;
var voice_1 = require("@discordjs/voice");
var discord_js_1 = require("discord.js");
var dotenv_1 = require("dotenv");
var fs_1 = require("fs");
var socket_io_1 = require("socket.io");
var ytdl_core_1 = __importDefault(require("ytdl-core"));
var sounds_json_1 = __importDefault(require("./sounds.json"));
var ms_1 = __importDefault(require("ms"));
function playRandomAudio() {
    var _a;
    var conns = voice_1.getVoiceConnections();
    var sound = sounds_json_1.default.sounds[Math.floor(Math.random() * sounds_json_1.default.sounds.length)];
    if (!sound)
        return;
    var audioResource = voice_1.createAudioResource(ytdl_core_1.default(sound, { filter: "audioonly" }));
    var audioPlayer = voice_1.createAudioPlayer({
        behaviors: {
            noSubscriber: voice_1.NoSubscriberBehavior.Pause,
        },
    });
    audioPlayer.play(audioResource);
    (_a = client.user) === null || _a === void 0 ? void 0 : _a.setActivity(sound);
    conns.forEach(function (conn) {
        var sub = conn.subscribe(audioPlayer);
    });
}
exports.playRandomAudio = playRandomAudio;
function playAudio(sound) {
    var _a;
    var conns = voice_1.getVoiceConnections();
    var audioResource = voice_1.createAudioResource(ytdl_core_1.default(sound, { filter: "audioonly" }));
    var audioPlayer = voice_1.createAudioPlayer({
        behaviors: {
            noSubscriber: voice_1.NoSubscriberBehavior.Pause,
        },
    });
    audioPlayer.play(audioResource);
    (_a = client.user) === null || _a === void 0 ? void 0 : _a.setActivity(sound);
    conns.forEach(function (conn) {
        var sub = conn.subscribe(audioPlayer);
    });
    audioPlayer.on(voice_1.AudioPlayerStatus.Idle, function () {
        audioPlayer.stop(true);
    });
}
exports.playAudio = playAudio;
dotenv_1.config();
var client = new discord_js_1.Client({
    intents: ["GuildMessages", "Guilds", "MessageContent", "GuildVoiceStates"],
});
var PREFIX = "s.";
client.on("ready", function (c) {
    var _a, _b;
    console.log("Logged in as " + ((_a = client.user) === null || _a === void 0 ? void 0 : _a.tag));
    // pick a random number between 2 and 10
    var random = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
    var sound = function () {
        var _a;
        playRandomAudio();
        random = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
        console.log("Playing next sound in " + random + " minutes");
        (_a = client.user) === null || _a === void 0 ? void 0 : _a.setActivity("⏱");
        setTimeout(sound, ms_1.default(random + "m"));
    };
    (_b = client.user) === null || _b === void 0 ? void 0 : _b.setActivity("⏱");
    console.log("Playing first sound in " + random + " minutes");
    setTimeout(sound, ms_1.default(random + "m"));
});
client.on("messageCreate", function (message) {
    var _a;
    if (message.author.bot)
        return;
    if (!message.content.startsWith(PREFIX))
        return;
    var args = message.content.slice(PREFIX.length).split(/ +/);
    var command = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    // check if command exists
    if (!fs_1.existsSync("./commands/" + command + ".ts")) {
        return;
    }
    var commandFile = require("./commands/" + command).default;
    commandFile.execute(message, args);
});
client.on("voiceStateUpdate", function (oldState, newState) {
    var _a;
    if (oldState.channelId === newState.channelId)
        return;
    if (!newState.channelId) {
        (_a = voice_1.getVoiceConnection(newState.guild.id)) === null || _a === void 0 ? void 0 : _a.destroy();
        return;
    }
    voice_1.joinVoiceChannel({
        channelId: newState.channelId,
        guildId: newState.guild.id,
        adapterCreator: newState.guild.voiceAdapterCreator,
        selfDeaf: true,
    });
});
var io = new socket_io_1.Server({
    cors: {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
    },
});
io.on("connection", function (socket) {
    socket.on("playSound", function (sound) {
        playAudio(sound);
    });
    socket.on("createSound", function (youtubeLink) {
        // @ts-ignore
        sounds_json_1.default.sounds.push(youtubeLink);
        fs_1.writeFileSync("./sounds.json", JSON.stringify(sounds_json_1.default, null, 2));
        socket.emit("update", sounds_json_1.default);
    });
    socket.on("deleteSound", function (sound, callback) {
        // @ts-ignore
        sounds_json_1.default.sounds.splice(sounds_json_1.default.sounds.indexOf(sound), 1);
        fs_1.writeFileSync("./sounds.json", JSON.stringify(sounds_json_1.default, null, 2));
        callback(sounds_json_1.default.sounds);
    });
    socket.on("listSounds", function (callback) {
        callback(sounds_json_1.default.sounds);
    });
});
io.listen(6969);
client.login(process.env.BOT_TOKEN).catch(console.error);
