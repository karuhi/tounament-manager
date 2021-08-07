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
require("dotenv").config();

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const apiRouter = require("./routes/api");
const pageRouter = require("./routes/page");

// app
const auth = require("./app/auth");

// 3000番ポートで待ちうける
app.listen(3000, () => {
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
  // TODO 開発中はセッション認証を無効
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
  // next();
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
    const user = await auth.login(credentialData);

    // サーバー未参加はログイン不可
    const isJoined = await auth.isServerJoined(user.id);
    if (!isJoined) {
      return res.redirect("/attention");
    }

    req.session.user = user;
  }
  res.redirect("/");
});

// API
app.use("/api", apiRouter);

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
