const fetch = require("node-fetch");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

exports.login = async (credential) => {
  const auth = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: new URLSearchParams(credential),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const token = await auth.json();
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${token.token_type} ${token.access_token}`,
    },
  });
  const user = await res.json();
  return user;
};

exports.isServerJoined = async (userId) => {
  const token = process.env.BOT_TOKEN;
  const serverId = process.env.BOT_SERVER_ID;
  const url = `https://discord.com/api/v6/guilds/${serverId}/members?limit=1000`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${token}`,
    },
  });
  const members = await res.json();
  return members.some((member) => member.user.id === userId);
};
