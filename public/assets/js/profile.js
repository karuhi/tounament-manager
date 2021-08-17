let profileElements = {
  playerName: document.getElementById("i_playerName"),
  playerNameRuby: document.getElementById("i_playerNameRuby"),
  rank: document.getElementById("i_rank"),
  platform: document.getElementById("i_platform"),
};

function loadMyProfile() {
  const param = {
    method: "GET",
  };
  fetch("/api/profile", param)
    .then((res) => res.json())
    .then((obj) => {
      const data = obj.data;
      if (data) {
        profileElements.playerName.value = data.playerName;
        profileElements.playerNameRuby.value = data.playerNameRuby;
        profileElements.rank.selectedIndex = data.rank;
        profileElements.platform.selectedIndex = data.platform;
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

function submitProfile() {
  const isValid = validateAll(Object.values(profileElements));
  if (!isValid) return;
  const data = Object.fromEntries(
    Object.keys(profileElements).map((key) => [key, profileElements[key].value])
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

window.onload = function () {
  loadMyProfile();
};
