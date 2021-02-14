import DiscordJS from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { Readable } from "stream";
dotenv.config();

(async () => {
    const {RADIO, TOKEN} = process.env;
    if (!RADIO || !TOKEN) {
      console.log("Missing RADIO and/or TOKEN env var");
      process.exit(1);
    }

    const stream = await fetch(RADIO).then((r) => {
        console.log(r.headers);
        return r.body;
    });

    const client: DiscordJS.Client = new DiscordJS.Client()
        .on("ready", () => console.log("connected :)"))
        .on("message", async (message: DiscordJS.Message) => {
            if (message.author.bot || !message.guild || !message.member) return;
            if (!message.content.startsWith("radio ")) return;
            const args = message.content.split(" ").slice(1);
            switch (args[0]) {
                case "on":
                    if (message.guild.me?.voice.connection)
                        return await message.reply("I am already in a channel");
                    if (!message.member.voice.channel)
                        return await message.reply("Join a channel first");
                    const connection = await message.member.voice.channel.join();
                    if (!connection)
                        return await message.reply(
                            "Unable to join the channel :("
                        );

                    connection.play(new Readable().wrap(stream));
                    break;
                case "off":
                    if (!message.guild.me?.voice.connection)
                        return await message.reply(
                            "I am not currently in a channel"
                        );
                    message.guild.me?.voice.connection.disconnect();
                    break;
                default:
                    await message.reply("radio [on|off]");
                    break;
            }
        });

    await client.login(TOKEN);
})();
