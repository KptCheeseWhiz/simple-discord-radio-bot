import DiscordJS from "discord.js";
import fetch from "node-fetch";
import { URL } from "url";
import dotenv from "dotenv";
import { Readable } from "stream";
dotenv.config();

const isURL = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

(async () => {
    const { TOKEN } = process.env;
    if (!TOKEN) {
        console.log("Missing TOKEN");
        process.exit(1);
    }

    const client: DiscordJS.Client = new DiscordJS.Client()
        .on("ready", () => console.log("connected :)"))
        .on("message", async (message: DiscordJS.Message) => {
            if (message.author.bot || !message.guild || !message.member) return;
            if (!message.content.startsWith("radio ")) return;
            const args = message.content.split(" ").slice(1);
            if (["stop", "leave", "off"].indexOf(args[0]) !== -1) {
                if (!message.guild.me?.voice.connection)
                    return await message.reply(
                        "I am not currently in a channel"
                    );
                message.guild.me?.voice.connection.disconnect();
            } else {
                if (!isURL(args[0]))
                    return await message.reply("Give me a full URL to play >:(");

                const resp = await fetch(args[0]);
                if (
                    !(resp.headers.get("content-type") || "").startsWith(
                        "audio/"
                    )
                )
                    return await message.reply(
                        "Uhh I don't think this is audio.."
                    );

                if (message.guild.me?.voice.connection)
                    return await message.reply("I am already in a channel");
                if (!message.member.voice.channel)
                    return await message.reply("Join a channel first");

                const connection = await message.member.voice.channel.join();
                if (!connection)
                    return await message.reply("Unable to join the channel :(");
                connection.play(new Readable().wrap(resp.body));
            }
        });

    await client.login(TOKEN);
})();
