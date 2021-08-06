window.onload = function () {
  loadTeams();
};

function loadTeams() {
  let targetElement = document.getElementById("teamsListContainer");

  fetch("/api/teams/list")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((team, idx) => {
        console.log(team);
        targetElement.innerHTML += `
      <tr>
        <td>${team.data.teamName}</td>
        <td>${team.data.players.length}/3人</td>
        <td>${
          team.data.players.length == 3
            ? `<button class="btn btn-success btn-disabled btn-xs">エントリー完了</button>`
            : `<button class="btn btn btn-warning btn-disabled btn-xs">未登録者あり</button>`
        }
        </td>
      </tr>`;
      });
    });
}

function joinTeamRequest(teamId) {
  console.log(`join team ${teamId}`);
}
