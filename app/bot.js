const fetch = require("node-fetch");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const db = require("../firebase");

const TOKEN = process.env.BOT_TOKEN;
const ENTRY_CHANNEL_ID = process.env.ENTRY_CHANNEL_ID;
const BASE_URL = "https://discord.com/api/v6";

// メンバー追加アクションでメッセージ送信(send, update含む)
exports.sendMessageByAddMemberAction = async (teamData) => {
  // チームメンバーのプロフィール取得
  let users = await db.collection("users").get();
  const players = teamData.players.map((player) =>
    users.docs.find((user) => user.id === player)
  );

  const embedFields = players.map((player) => {
    const data = player.data();
    return {
      name: `${teamData.leader == player.id ? "👑 " : ":name_badge: "}${
        data.playerName
      }（${data.playerNameRuby}）`,
      value: `${rankId2RankStr(data.rank)}`,
      inline: true,
    };
  });

  return await sendtoDiscord(embedFields, teamData);
};

// メッセージ削除（チーム削除時）
exports.deleteMessageAction = async (messageId) => {
  const url = `${BASE_URL}/channels/${ENTRY_CHANNEL_ID}/messages/${messageId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bot ${TOKEN}`,
    },
  });
  return res.ok;
};

async function sendtoDiscord(embedFields, teamData) {
  embedFields.push({
    name: "📒 意気込み",
    value: `${teamData.comment}`,
  });
  const content =
    teamData.players.length < 3
      ? "プレイヤー全員の登録が必要です。(プレイヤー数が3人未満のため表示されません。)"
      : "";
  const message = {
    embed: {
      content: content,
      title: content,
      description:
        "チームメンバーに変更がある際は、[こちら](https://app.supercolliderportal.org/members)から変更してください。",
      color: 16768583,
      timestamp: new Date(),
      footer: {
        icon_url:
          "https://cdn.discordapp.com/attachments/860665491969671178/872515420102479922/b258c78d6e808642.png",
        text: "DETONATOR OPEN #2",
      },
      author: {
        name: `🚀 ${teamData.teamName}（${teamData.teamNameRuby}）`,
      },
      fields: teamData.players.length < 3 ? [] : embedFields,
    },
  };

  let messageExists = teamData.messageId;
  const url = `${BASE_URL}/channels/${ENTRY_CHANNEL_ID}/messages${
    messageExists ? `/${teamData.messageId}` : ""
  }`;
  const res = await fetch(url, {
    method: messageExists ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${TOKEN}`,
    },
    body: JSON.stringify(message),
  });
  const jsonData = await res.json();
  return jsonData.id;
}

// ランクIDをランクの名前に変換するやつ
function rankId2RankStr(id) {
  const rank = [
    "",
    "Supersonic Legend",
    "Grand Champion III",
    "Grand Champion II",
    "Grand Champion I",
    "Champion III",
    "Champion II",
    "Champion I",
    "Diamond III",
    "Diamond II",
    "Diamond I",
    "Platinum III",
    "Platinum II",
    "Platinum I",
    "Gold III",
    "Gold II",
    "Gold I",
    "Silver III",
    "Silver II",
    "Silver I",
    "Bronze III",
    "Bronze II",
    "Bronze I",
    "Unranked",
  ];
  return rank[id];
}

// プラットフォームIDをプラットフォームの名前に変換するやつ
function platId2PlatStr(id) {
  const platform = ["", "PC", "PS4", "Xbox One", "Nintendo Switch"];
  return platform[id];
}
