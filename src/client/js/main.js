//import "../scss/styles.scss";

console.log("hi");
//alert('hi');


function _makeChartRow(rank, title, played)
{
    const divRow = document.createElement("div");
    const divCol1 = document.createElement("div");
    const divCol2 = document.createElement("div");
    const divCol3 = document.createElement("div");
    const divCol1Span = document.createElement("span");
    const divCol2Span = document.createElement("span");
    const divCol3Span = document.createElement("span");


    divCol1Span.innerText = rank;
    divCol2Span.innerText = title;
    divCol3Span.innerText = played;

    divCol1.appendChild(divCol1Span);
    divCol2.appendChild(divCol2Span);
    divCol3.appendChild(divCol3Span);

    divRow.appendChild(divCol1);
    divRow.appendChild(divCol2);
    divRow.appendChild(divCol3);

    return divRow;
}

function getMusicChart()
{
    const mc = document.querySelector("#musicChart");
    mc.appendChild(_makeChartRow('Rank', 'Title', 'Played'));

    const url = `http://localhost:4000/top10`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            for (let i = 0; i < data.length; i++) {
                mc.appendChild(_makeChartRow(i+1, data[i].title, data[i].played));
            }
        });    
}

getMusicChart();

// Login proc
const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (e) => {
    console.log("login proc");
  e.preventDefault();

  const username = loginForm.elements.username.value;
  const password = loginForm.elements.password.value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.status === 200) {
    const { token } = await response.json();
    localStorage.setItem('token', token);
    //updateUI();
    updateLoginUI();
  }
});

function updateLoginUI()
{
    const logoff = document.getElementById("logoff");
    const loggedin = document.getElementById("loggedin");

    logoff.classList.add("hide");
    loggedin.classList.remove("hide");
}

async function getFavorite()
{
    const url = `http://localhost:4000/song/favorite`;

    const token = localStorage.getItem('token');

    await fetch(url, {headers: {Authorization: `${token}`,},})
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });   
}


loggedin.classList.add("hide");