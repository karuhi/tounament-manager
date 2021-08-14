/**
 * /app.js
 */
// express モジュールのインスタンス作成
const express = require("express");
const app = express();

// パス指定用モジュール
const path = require("path");
const fetch = require("node-fetch");

// secrets
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const apiRouter = require("./routes/api");
const pageRouter = require("./routes/page");

// app
const auth = require("./app/auth");

// firebase
const db = require("./firebase");

// 3000番ポートで待ちうける
app.listen(3000, () => {
  console.info("environment : " + process.env.NODE_ENV);
  console.log("Running at Port 3000...");
});

// 静的ファイルのルーティング
app.use("/assets", express.static(__dirname + "/public/assets"));
// app.use(express.static(path.join(__dirname, "public")));

// セッション
const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxage: 1000 * 60 * 30,
    },
  })
);

const sessionCheck = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// ログインページ
app.get("/login", (req, res) => {
  return res.sendFile(path.join(__dirname, "public/login.html"));
});

// もしDiscordサーバーに入ってなかったらのページ
app.get("/attention", (req, res) => {
  return res.sendFile(path.join(__dirname, "public/attention.html"));
});

// ログインコールバック
app.get("/api/auth", async (req, res) => {
  req.session.user = null;
  if (req.query.code) {
    const accessCode = req.query.code;
    const credentialData = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: process.env.GRANT_TYPE,
      redirect_uri: process.env.REDIRECT_URI,
      code: accessCode,
      scope: process.env.SCOPE,
    };
    const discordUser = await auth.login(credentialData);

    // サーバー未参加はログイン不可
    const isJoined = await auth.isServerJoined(discordUser.id);

    if (!isJoined) {
      return res.redirect("/attention");
    } else {
      req.session.user = discordUser;
      const userData = await db
        .collection("users")
        .doc(discordUser.id)
        .get()
        .then((user) => {
          return user.data();
        })
        .catch((err) => {
          return;
        });

      if (userData == undefined) {
        // ユーザー新規登録
        db.collection("users")
          .doc(discordUser.id)
          .set({
            platform: "",
            playerName: "",
            playerNameRuby: "",
            rank: "",
          })
          .then((user) => {
            res.redirect("/profile");
          })
          .catch((err) => {
            return;
          });
      } else if (
        userData.platform === "" ||
        userData.playerName === "" ||
        userData.playerNameRuby === "" ||
        userData.rank === ""
      ) {
        // プロフィール未設定ユーザー
        res.redirect("/profile");
      } else {
        res.redirect("/");
      }
    }
  } else {
    res.redirect("/");
  }
});

// API
app.use("/api", apiRouter);

// 開発環境からリダイレクト設定を出しわける(ログイン後のredirect先が変わる)
app.get("/auth/discord", (req, res) => {
  const baseUrl = "https://discord.com/api/oauth2/authorize?";
  const loginUrl =
    baseUrl +
    new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.REDIRECT_URI,
      response_type: "code",
      scope: "identify",
    }).toString();
  res.redirect(302, loginUrl);
});

// 各ページ
app.use("/", sessionCheck, pageRouter);

app.get("/hello", (req, res) => {
  var param = { result: "Hello World !" };
  res.header("Content-Type", "application/json; charset=utf-8");
  res.send(param);
});

// その他のリクエストに対する404エラー
app.use((req, res) => {
  res.sendStatus(404);
});
