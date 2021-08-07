const express = require("express");
const router = express.Router();
const db = require("../firebase");

// プロフィール設定
router.post("/profile", (req, res) => {
  if (req.session.user) {
    const data = req.body;
    db.collection("users")
      .doc(req.session.user.id)
      .set(data)
      .then((res) => {
        res.sendStatus(200);
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
      console.dir(inviteEnableUsers);
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
      const users = await (
        await db.collection("users").get()
      ).docs.map((d) => ({ id: d.id, data: d.data() }));
      const teams = await db
        .collection("teams")
        .where("players", "array-contains", req.session.user.id)
        .get();
      let team = null;
      if (!teams.empty) {
        const doc = teams.docs[0];
        team = doc.data();
        team["id"] = doc.id;
        team["members"] = team.players.map((id) =>
          users.find((u) => u.id === id)
        );
      }
      res.status(200).send(team);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.sendStatus(401);
  }
});

// チーム作成
router.post("/teams/new", (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    data["leader"] = req.session.user.id;
    data["players"] = [req.session.user.id];
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
      .then((doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        let updateData = {
          teamName: data.teamName,
          teamNameRuby: data.teamNameRuby,
          comment: data.comment,
        };

        db.collection("teams")
          .doc(data.id)
          .update(updateData)
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
router.post("/teams/members/add", (req, res) => {
  const data = req.body;
  if (req.session.user) {
    // 処理
    db.collection("teams")
      .doc(data.teamId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        // 登録メンバーに対象のプレイヤーを追加
        const players = doc.data().players.concat([data.playerId]);
        let updateData = {
          players: players,
        };

        db.collection("teams")
          .doc(data.teamId)
          .update(updateData)
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
      .then((doc) => {
        if (!doc.exists) {
          console.log("not found");
          return res.sendStatus(404);
        }

        // 登録メンバーから対象のプレイヤーを除外
        const players = doc
          .data()
          .players.filter((player) => player !== data.playerId);
        let updateData = {
          players: players,
        };

        db.collection("teams")
          .doc(data.teamId)
          .update(updateData)
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

module.exports = router;
