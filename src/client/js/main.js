//import "../scss/styles.scss";

console.log("hi");

let username = "";
//alert('hi');

function _makeFavoriteRow(no, title, author, id) {
  const divRow = document.createElement("div");

  const divCol1 = document.createElement("div");
  const divCol2 = document.createElement("div");
  const divCol3 = document.createElement("div");
  const divCol4 = document.createElement("div");

  const divCol1Span = document.createElement("span");
  const divCol2Span = document.createElement("span");
  const divCol3Span = document.createElement("span");
  const divCol4Span = document.createElement("span");

  const divCol4i = document.createElement("i");
  divCol4i.classList.add("fas");
  divCol4i.classList.add("fa-play");

  divCol1Span.innerText = no;
  divCol2Span.innerText = title;
  divCol3Span.innerText = author;
  divCol4Span.innerText = "PLAY";

  divCol1.appendChild(divCol1Span);
  divCol2.appendChild(divCol2Span);
  divCol3.appendChild(divCol3Span);

  if (no === "No") {
    divCol4.appendChild(divCol4Span);
  } else {
    divCol4.appendChild(divCol4i);
  }

  divRow.appendChild(divCol1);
  divRow.appendChild(divCol2);
  divRow.appendChild(divCol3);
  divRow.appendChild(divCol4);

  divRow.id = id;

  divCol4.addEventListener("click", handleMusicPlay);

  return divRow;
}

function handleMusicPlay(event) {
  const parentElement = event.currentTarget.parentNode;
  const parentId = parentElement.id;
  //alert(`play: ${parentId}`);
  player.loadVideoById(parentId);
  addPlayCount(parentId);
}

function handleAddFavorite(event) {
  const parentElement = event.currentTarget.parentNode;
  const parentId = parentElement.id;
  //alert(`favorite: ${parentId}`);
  addFavorite(parentId);
  getFavorite();
}

function _makeChartRow(rank, title, author, played, id) {
  const divRow = document.createElement("div");
  const divCol1 = document.createElement("div");
  const divCol2 = document.createElement("div");
  const divCol3 = document.createElement("div");
  const divCol4 = document.createElement("div");
  const divCol5 = document.createElement("div");
  const divCol6 = document.createElement("div");

  const divCol1Span = document.createElement("span");
  const divCol2Span = document.createElement("span");
  const divCol3Span = document.createElement("span");
  const divCol4Span = document.createElement("span");
  const divCol5Span = document.createElement("span");
  const divCol6Span = document.createElement("span");

  const divCol5i = document.createElement("i");
  divCol5i.classList.add("fas");
  divCol5i.classList.add("fa-play");

  const divCol6i = document.createElement("i");
  divCol6i.classList.add("fas");
  divCol6i.classList.add("fa-plus-square");

  divCol1Span.innerText = rank;
  divCol2Span.innerText = title;
  divCol3Span.innerText = author;
  divCol4Span.innerText = played;
  divCol5Span.innerText = "PLAY";
  divCol6Span.innerText = "ADD";

  divCol1.appendChild(divCol1Span);
  divCol2.appendChild(divCol2Span);
  divCol3.appendChild(divCol3Span);
  divCol4.appendChild(divCol4Span);

  if (rank === "Rank") {
    divCol5.appendChild(divCol5Span);
  } else {
    divCol5.appendChild(divCol5i);
  }

  if (rank === "Rank") {
    divCol6.appendChild(divCol6Span);
  } else {
    divCol6.appendChild(divCol6i);
  }

  divRow.appendChild(divCol1);
  divRow.appendChild(divCol2);
  divRow.appendChild(divCol3);
  divRow.appendChild(divCol4);
  divRow.appendChild(divCol5);
  divRow.appendChild(divCol6);

  divRow.id = id;

  divCol5.addEventListener("click", handleMusicPlay);
  divCol6.addEventListener("click", handleAddFavorite);

  return divRow;
}

function getMusicChart() {
  const mc = document.querySelector("#musicChart");

  // 기존에 로드된 요소 모두 제거
  while (mc.firstChild) {
    mc.removeChild(mc.firstChild);
  }

  mc.appendChild(
    _makeChartRow("Rank", "Title", "author", "Played", "Play", "Favorite")
  );

  //const url = `http://localhost:4000/top10`;
  const url = `${window.location.href}top10`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      for (let i = 0; i < data.length; i++) {
        mc.appendChild(
          _makeChartRow(
            i + 1,
            data[i].title,
            data[i].author,
            data[i].played,
            data[i].id
          )
        );
      }
    });
}

getMusicChart();

// Login proc
const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", async (e) => {
  console.log("login proc");
  e.preventDefault();

  const username = loginForm.elements.username.value;
  const password = loginForm.elements.password.value;

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.status === 200) {
    const { token } = await response.json();
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    updateLoginUI();
    getFavorite();
  }
});

// 로그인 성공 시 UI 갱신
function updateLoginUI() {
  const logoff = document.getElementById("logoff");
  const loggedin = document.getElementById("loggedin");

  logoff.classList.add("hide");
  loggedin.classList.remove("hide");
}

async function getFavorite() {
  const fav = document.querySelector("#favorite");

  // 기존에 로드된 요소 모두 제거
  while (fav.firstChild) {
    fav.removeChild(fav.firstChild);
  }

  fav.appendChild(_makeFavoriteRow("No", "Title", "author", "Play"));

  //const url = `http://localhost:4000/song/favorite`;
  const url = `${window.location.href}song/favorite`;

  const token = localStorage.getItem("token");

  await fetch(url, { headers: { Authorization: `${token}` } })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      // musicList를 초기화합니다.
      musicList = [];

      for (let i = 0; i < data.length; i++) {
        fav.appendChild(
          _makeFavoriteRow(i + 1, data[i].title, data[i].author, data[i].id)
        );

        musicList.push({
          id: data[i].id,
          title: data[i].title,
          artist: data[i].author,
        });
      }
    });
}

async function addFavorite(id) {
  const _token = localStorage.getItem("token");
  const _username = localStorage.getItem("username");
  const _id = id; // 추가할 노래 ID

  if (!(_token && _username && _id)) {
    return;
  }

  //const url = "http://localhost:4000/song/favorite/add";
  const url = `${window.location.href}song/favorite/add`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: _username,
        id: _id,
      }),
    });
    if (response.status === 200) {
      console.log("OK");
      // 여기에 추가로 처리해야 할 코드 작성
    } else {
      console.log("Failed to add favorite");
    }
  } catch (error) {
    console.error(error);
    console.log("Failed to add favorite");
  }
}

loggedin.classList.add("hide");

// 토근, 유저네임이 로컬스토리지에 들어있는 경우 토큰 검증을 하고 성공 시 로그인 한 것으로 처리
async function checkLoggedIn() {
  const _token = localStorage.getItem("token");
  const _username = localStorage.getItem("username");

  if (_token && _username) {
    // 즐겨찾기 가져오기
    //const url = "http://localhost:4000/song/favorite";
    const url = `${window.location.href}song/favorite`;

    const token = localStorage.getItem("token");

    await fetch(url, { headers: { Authorization: `${token}` } })
      .then((response) => {
        if (response.ok) {
          console.log("ok");

          // 로그인 된 것으로 처리
          updateLoginUI();
          getFavorite();
        }
      })
      .catch((error) => {
        console.error(error);
        localStorage.setItem("token", "");
        localStorage.setItem("username", "");
      });
  }
}

checkLoggedIn();
