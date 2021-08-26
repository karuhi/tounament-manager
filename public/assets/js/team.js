let teamId;
const teamElements = {
  teamName: document.getElementById("i_teamName"),
  teamNameRuby: document.getElementById("i_teamNameRuby"),
  comment: document.getElementById("i_comment"),
};

function loadMyTeam() {
  const param = {
    method: "GET",
  };
  fetch("/api/teams/myteam", param)
    .then((res) => res.json())
    .then((obj) => {
      const data = obj.data;
      if (data) {
        teamId = data.id;
        document.getElementById("title").textContent = "マイチーム編集";
        document.getElementById("btn_submit").textContent = "保存する";
        document.getElementById("btn_members").classList.remove("hidden");
        document.getElementById("btn_delete").classList.remove("hidden");
        teamElements.teamName.value = data.teamName;
        teamElements.teamNameRuby.value = data.teamNameRuby;
        teamElements.comment.value = data.comment;
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

function submitTeam() {
  const isValid = validateAll([
    teamElements.teamName,
    teamElements.teamNameRuby,
  ]);
  teamElements.comment.value = teamElements.comment.value.replace(/\r?\n/g, "");
  if (!isValid) return;

  const data = Object.fromEntries(
    Object.keys(teamElements).map((key) => [key, teamElements[key].value])
  );

  let url = "/api/teams/new";
  if (teamId) {
    data["id"] = teamId;
    url = "/api/teams/edit";
    const param = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(data),
    };

    fetch(url, param)
      .then((res) => {
        location.href = "/";
      })
      .catch((error) => {
        alert(error.message);
      });
  } else {
    alert("新規エントリーの受付は終了しました。（2021/08/26 23:59まで）");
  }
}

function deleteTeam() {
  let data = {
    id: teamId,
  };
  let url = "/api/teams/delete";

  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(data),
  };

  fetch(url, param)
    .then((res) => {
      location.href = "/";
    })
    .catch((error) => {
      alert(error.message);
    });
}

window.onload = function () {
  loadMyTeam();
};
