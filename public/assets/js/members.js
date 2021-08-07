let myTeam;

async function loadMyTeam() {
  try {
    const param = {
      method: "GET",
    };
    const res = await fetch("/api/teams/myteam", param);
    const obj = await res.json();
    const data = obj.data;
    myTeam = data;

    const memberList = document.getElementById("members");
    memberList.innerHTML = "";

    if (data) {
      document.getElementById("teamName").textContent = data.teamName;
      const elements = data.members.map((member) => {
        let html = `<li id="${member.id}" class="mb-4 xl:mb-8">${member.data.playerName}`;
        if (member.id !== data.leader) {
          html += `<button class="btn btn-primary" onclick="deleteMember('${member.id}')">削除</button>`;
        }
        html += "</li>";
        return html;
      });
      memberList.innerHTML = elements.join("");
    }
  } catch (error) {
    alert(error.message);
    location.href = "/";
  }
}

async function loadFreeUsers() {
  try {
    const param = {
      method: "GET",
    };
    document.getElementById("newMember").classList.remove("hidden");

    const res = await fetch("/api/users/free", param);
    const data = await res.json();

    const defaultOption =
      '<option value="-1" disabled="disabled" selected="selected">メンバーを選択</option>';
    if (data) {
      const options = data.map((user) => {
        return `<option value="${user.id}">${user.data.playerName}</option>`;
      });
      document.getElementById("player").innerHTML =
        defaultOption + options.join("");
    }
  } catch (error) {
    alert(error.message);
    location.href = "/";
  }
}

function addMember() {
  const playerId = document.getElementById("player").value;
  if (playerId === "-1") {
    alert("メンバーを選択してください。");
    return;
  }
  const data = {
    teamId: myTeam.id,
    playerId: playerId,
  };
  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(data),
  };
  fetch("/api/teams/members/add", param)
    .then((res) => {
      location.href = "/members";
    })
    .catch((error) => {
      alert(error.message);
    });
}

function deleteMember(playerId) {
  const data = {
    teamId: myTeam.id,
    playerId: playerId,
  };
  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(data),
  };
  fetch("/api/teams/members/delete", param)
    .then((res) => {
      location.href = "/members";
    })
    .catch((error) => {
      alert(error.message);
    });
}

window.onload = async function () {
  await loadMyTeam();
  if (myTeam.players.length < 4) {
    await loadFreeUsers();
  }
};
