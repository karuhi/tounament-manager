function submitProfile() {
  let playerData = {
    playerName: document.getElementById("i_playerName"),
    playerNameRuby: document.getElementById("i_playerNameRuby"),
    rank: document.getElementById("i_rank"),
    platform: document.getElementById("i_platform"),
  };
  const isValid = validateAll(Object.values(playerData));
  if (!isValid) return;
  const data = Object.fromEntries(
    Object.keys(playerData).map((key) => [key, playerData[key].value])
  );
  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(data),
  };
  fetch("/api/profile", param)
    .then((res) => {
      location.href = "/";
    })
    .catch((error) => {
      alert(error.message);
    });
}
