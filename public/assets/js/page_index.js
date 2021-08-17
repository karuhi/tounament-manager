window.onload = function () {
  loadTeams();
};

function loadTeams() {
  let targetElement = document.getElementById("teamsListContainer");

  fetch("/api/teams/list")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((team, idx) => {
        targetElement.innerHTML += `
      <tr>
        <td>${team.data.teamName}</td>
        <td>${team.data.players.length}/4人</td>
        <td>${
          team.data.players.length >= 3
            ? `<button class="btn btn-success btn-disabled btn-xs">エントリー完了</button>`
            : `<button class="btn btn btn-warning btn-disabled btn-xs">準備中</button>`
        }
        </td>
      </tr>`;
      });
    });
}
