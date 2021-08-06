let teamId;

function loadMyTeam() {
  const param = {
    method: "GET",
  };
  fetch("/api/teams/myteam", param)
    .then((res) => res.json())
    .then((data) => {
      console.dir(data);
      if (data) {
        teamId = data.id;
        document.getElementById("teamName").textContent = data.teamName;
      }
    })
    .catch((error) => {
      alert(error.message);
      location.href = "/";
    });
}

function submitTeam() {
  // const isValid = validateAll([
  //   teamElements.teamName,
  //   teamElements.teamNameRuby,
  // ]);
  // if (!isValid) return;
  // const data = Object.fromEntries(
  //   Object.keys(teamElements).map((key) => [key, teamElements[key].value])
  // );
  // let url = "/api/teams/new";
  // if (teamId) {
  //   data["id"] = teamId;
  //   url = "/api/teams/edit";
  // }
  // const param = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json; charset=utf-8",
  //   },
  //   body: JSON.stringify(data),
  // };
  // fetch(url, param)
  //   .then((res) => {
  //     // location.href = "/";
  //     console.log(res);
  //   })
  //   .catch((error) => {
  //     alert(error.message);
  //   });
}

window.onload = function () {
  loadMyTeam();
};
