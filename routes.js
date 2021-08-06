const express = require("express");
const router = express.Router();

const path = require("path");

const sendPageFile = (res, pageName) => {
  res.sendFile(path.join(__dirname, `public/${pageName}.html`));
};

const urls = {
  index: "/",
  profile: "/profile",
  team: "/team",
  members: "/members",
};

Object.keys(urls).forEach((key) => {
  router.get(urls[key], (req, res) => sendPageFile(res, key));
});

module.exports = router;
