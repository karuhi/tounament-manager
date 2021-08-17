const express = require("express");
const router = express.Router();
const db = require("../firebase");
const bot = require("../app/bot");

// プロフィール設定
router.post("/profile", async (req, res) => {
  if (req.session.user) {
    const data = req.body;
    db.collection("users")
      .doc(req.session.user.id)
      .set(data)
      .then(async (doc) => {
        // Discordメッセージに反映
        const myteam = await getMyteam(req.session.user);
        await bot.sendMessageByAddMemberAction(myteam);
        res.sendStatus(200);
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// プロフィールを取得
router.get("/profile", (req, res) => {
  if (req.session.user) {
    db.collection("users")
      .doc(req.session.user.id)
      .get()
      .then((doc) => {
        const user = doc.data();
        res.status(200).send({ data: user });
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// 招待可能なユーザー取得
router.get("/users/free", async (req, res) => {
  if (req.session.user) {
    const data = req.body;
    try {
      const users = await (
        await db.collection("users").get()
      ).docs.map((d) => ({ id: d.id, data: d.data() }));
      const teams = await (
        await db.collection("teams").get()
      ).docs.map((d) => d.data());

      const inviteEnableUsers = users.filter((user) => {
        return !teams.some((team) => team.players.includes(user.id));
      });
      // console.dir(inviteEnableUsers);
      res.status(200).send(inviteEnableUsers);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.sendStatus(401);
  }
});

// マイチーム取得
router.get("/teams/myteam", async (req, res) => {
  if (req.session.user) {
    // 処理
    try {
      res.status(200).send({ data: await getMyteam(req.session.user) });
    } catch (err) {
      res.send(err);
    }
  } else {
    res.sendStatus(401);
  }
});

// チーム作成
router.post("/teams/new", async (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    data["leader"] = req.session.user.id;
    data["players"] = [req.session.user.id];

    data["messageId"] = await bot.sendMessageByAddMemberAction(data);

    db.collection("teams")
      .add(data)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// チーム編集
router.post("/teams/edit", (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    db.collection("teams")
      .doc(data.id)
      .get()
      .then(async (doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        const teamData = doc.data();
        teamData.teamName = data.teamName;
        teamData.teamNameRuby = data.teamNameRuby;
        teamData.comment = data.comment;

        teamData.messageId = await bot.sendMessageByAddMemberAction(teamData);

        db.collection("teams")
          .doc(data.id)
          .update(teamData)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// チーム削除
router.post("/teams/delete", (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    db.collection("teams")
      .doc(data.id)
      .get()
      .then(async (doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        // Discordメッセージ削除
        const messageId = doc.data().messageId;
        if (messageId) {
          const isOk = await bot.deleteMessageAction(messageId);
          if (!isOk) return res.sendStatus(500);
        }

        db.collection("teams")
          .doc(data.id)
          .delete()
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// チームのリストを全て取得する
router.get("/teams/list", async (req, res) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  db.collection("teams")
    .get()
    .then((snapshot) => {
      let list = [];
      snapshot.forEach((doc) => {
        list.push({ docId: doc.id, data: doc.data() });
      });
      res.status(200).send(list);
    })
    .catch((err) => {
      res.send(err);
    });
});

// チームメンバー追加
router.post("/teams/members/add", async (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    db.collection("teams")
      .doc(data.teamId)
      .get()
      .then(async (doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        // 登録メンバーに対象のプレイヤーを追加
        const teamData = doc.data();
        teamData.players = teamData.players.concat([data.playerId]);
        if (teamData.players.length >= 3) {
          const id = await bot.sendMessageByAddMemberAction(teamData);
          teamData.messageId = id;
        }

        db.collection("teams")
          .doc(data.teamId)
          .update(teamData)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

// チームメンバー削除
router.post("/teams/members/delete", (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    db.collection("teams")
      .doc(data.teamId)
      .get()
      .then(async (doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        // 登録メンバーから対象のプレイヤーを除外
        const teamData = doc.data();
        teamData.players = teamData.players.filter(
          (player) => player !== data.playerId
        );
        const id = await bot.sendMessageByAddMemberAction(teamData);
        teamData.messageId = id;

        db.collection("teams")
          .doc(data.teamId)
          .update(teamData)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.sendStatus(401);
  }
});

async function getMyteam(user) {
  const users = (await db.collection("users").get()).docs.map((d) => ({
    id: d.id,
    data: d.data(),
  }));
  const teams = await db
    .collection("teams")
    .where("players", "array-contains", user.id)
    .get();
  let team = null;
  if (!teams.empty) {
    const doc = teams.docs[0];
    team = doc.data();
    team["id"] = doc.id;
    team["members"] = team.players.map((id) => users.find((u) => u.id === id));
  }
  return team;
}

module.exports = router;
