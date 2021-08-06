const express = require("express");
const router = express.Router();

// Firebase
let admin = require("firebase-admin");
let serviceAccount = require("../key/app-supercollider-firebase-adminsdk-b0xve-492a59cf54.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

// マイチーム取得
router.get("/teams/myteam", (req, res) => {
  if (req.session.user) {
    // 処理
    db.collection("teams")
      .where("players", "array-contains", req.session.user.id)
      .get()
      .then((querySnapshot) => {
        let team = null;
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          team = doc.data();
          team["id"] = doc.id;
        }
        res.status(200).send(team);
      })
      .catch((err) => {
        res.send(err);
      });
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

module.exports = router;
