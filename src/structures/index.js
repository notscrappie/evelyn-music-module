const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { Connectors } = require("shoukaku");
const { Kazagumo } = require("kazagumo");
const Spotify = require("kazagumo-spotify");

const { GuildVoiceStates } = GatewayIntentBits;
const { User, Message, Channel, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [GuildVoiceStates],
  partials: [User, Message, Channel, GuildMember, ThreadMember],
});

client.config = require("./config.json");
client.buttons = new Collection();

const { loadShoukakuNodes } = require("./handlers/shoukakuNodes.js");
const { loadShoukakuPlayer } = require("./handlers/shoukakuPlayer.js");
const { loadButtons } = require("./handlers/buttons.js");

const kazagumoClient = new Kazagumo(
  {
    plugins: [
      new Spotify({
        clientId: client.config.spotifyClientID,
        clientSecret: client.config.spotifySecret,
      }),
    ],
    defaultSearchEngine: "youtube",
    send: (id, payload) => {
      let guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  client.config.nodes,
  {
    moveOnDisconnect: false,
    resume: true,
    reconnectTries: 5,
    restTimeout: 10000,
  }
);

client.manager = kazagumoClient;
module.exports = client;

loadButtons(client);
loadShoukakuNodes(client);
loadShoukakuPlayer(client);

client.login(client.config.token);
