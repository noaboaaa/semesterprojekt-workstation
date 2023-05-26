"use strict";

// ======================================= CONSTANTS =======================================
const endpoint = "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/";
let posts = [];
let results = [];

// ======================================= INITIALIZATION =======================================
document.addEventListener("DOMContentLoaded", (event) => {
  initApp();
  setUpEventListeners();
});

// ======================================= EVENT LISTENERS SETUP =======================================
function setUpEventListeners() {
  setUpUpdateResultsButtonListener();
  setUpFormSubmissionListener();
  setUpFilterButtonsListeners();
  setUpCloseFormListener();
}

function setUpUpdateResultsButtonListener() {
  const postContainer = document.getElementById("post-container");
  postContainer.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("update-results")) {
      const postElement = event.target.closest(".post");
      const memberId = postElement.dataset.memberId;
      const resultId = event.target.dataset.resultId;
      openUpdateResultsForm(memberId, resultId);
    }
  });
}

function setUpFormSubmissionListener() {
  document
    .querySelector("#updateResultsForm form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      updateFormSubmit();
      document.querySelector("#updateResultsForm").style.display = "none";
    });
}

function setUpFilterButtonsListeners() {
  document
    .getElementById("junior-filter-button")
    .addEventListener("click", () => {
      openTopSwimmersDialog("junior");
    });

  document
    .getElementById("senior-filter-button")
    .addEventListener("click", () => {
      openTopSwimmersDialog("senior");
    });
}

function setUpCloseFormListener() {
  document
    .querySelector("#closeUpdateResultsForm")
    .addEventListener("click", function () {
      document.querySelector("#updateResultsForm").style.display = "none";
    });
}

// ======================================= APPLICATION INITIALIZATION =======================================
async function initApp() {
  console.log("App is running");
  posts = await getPosts();
  await getResults();
  updatePostsGrid();
}

// ======================================= FORM SUBMISSION =======================================
function updateFormSubmit() {
  const type = document.querySelector("#updateType").value;
  const discipline = document.querySelector("#updateDiscipline").value;
  const resultTime = document.querySelector("#updateResultTime").value;
  const date = document.querySelector("#updateDate").value;

  const form = document.querySelector("#updateResultsForm form");
  const memberId = form.dataset.memberId;
  const resultId = form.dataset.resultId;

  const result = {
    id: resultId,
    memberId: memberId,
    type,
    discipline,
    resultTime,
    date,
  };

  updateResult(memberId, resultId, result);
}

// ======================================= CRUD OPERATIONS =======================================
async function getPosts() {
  try {
    const response = await fetch(`${endpoint}/posts.json`);
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      console.log("No posts found.");
      return [];
    }

    const postObjects = Object.entries(data).map(([postId, post]) => ({
      id: postId,
      ...post,
    }));

    const competitiveSwimmers = postObjects.filter(
      (post) => post.swimmerType === "competitive"
    );

    return competitiveSwimmers;
  } catch (error) {
    console.log("Error fetching posts:", error);
    return [];
  }
}

async function getResults() {
  try {
    const response = await fetch(`${endpoint}/results.json`);
    const data = await response.json();
    results = Object.entries(data).map(([id, result]) => ({
      id,
      ...result,
    }));
    console.log("Results:", results);

    return results; 
  } catch (error) {
    console.error("Error fetching results:", error);
    return [];
  }
}

function openUpdateResultsForm(memberId, resultId) {
  const memberResult = results.find(
    (result) => result.memberId === memberId && result.id === resultId
  );

  if (memberResult) {
    document.querySelector("#updateType").value = memberResult.type;
    document.querySelector("#updateDiscipline").value = memberResult.discipline;
    document.querySelector("#updateResultTime").value = memberResult.resultTime;
    document.querySelector("#updateDate").value = memberResult.date;

    const form = document.querySelector("#updateResultsForm form");
    form.dataset.memberId = memberResult.memberId;
    form.dataset.resultId = memberResult.id;

    document.querySelector("#updateResultsForm").style.display = "block";
  } else {
    console.log("Member result not found.");
  }
}

async function updateResult(memberId, resultId, result) {
  try {
    const response = await fetch(`${endpoint}/results/${resultId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    const index = results.findIndex(
      (result) => result.memberId === memberId && result.id === resultId
    );
    results[index] = result;
    updatePostsGrid();
  } catch (error) {
    console.error("Error updating result:", error);
  }
}

// ======================================= DATA DISPLAY =======================================
async function updatePostsGrid() {
  try {
    console.log("Fetched posts:", posts);
    const postContainer = document.querySelector("#post-container");
    postContainer.innerHTML = "";
    await getResults();
    console.log("Fetched results:", results);

    posts.forEach((post) => {
      let resultsHTML = "";
      const postResults = results.filter(
        (result) => result.memberId === post.memberId
      );

      postResults.forEach((result) => {
        resultsHTML += `
<div class="result">
  <p>Type: ${result.type}</p>
  <p>Discipline: ${result.discipline}</p>
  <p>Result Time: ${result.resultTime}</p>
  <p>Date: ${result.date}</p>
  <button class="update-results" data-member-id="${post.memberId}" data-result-id="${result.id}">Update Result</button>
</div>`;
      });

      const postHTML = `
        <div class="post" data-member-id="${post.memberId}">
          <h2>${post.name}</h2>
          <p>Age: ${post.age}</p>
          <p>Team: ${post.team}</p>
          ${resultsHTML}
        </div>`;

      postContainer.innerHTML += postHTML;
    });
  } catch (error) {
    console.error("Error updating posts grid:", error);
  }

}

function openTopSwimmersDialog(team) {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog");
  dialog.id = "topSwimmersDialog";
  dialog.innerHTML = `
    <h2>Top Swimmers - ${team.charAt(0).toUpperCase() + team.slice(1)} Team</h2>
    <div id="topSwimmersContent"></div>
    <button id="closeTopSwimmersButton">Close</button>
  `;

  const closeTopSwimmersButton = dialog.querySelector(
    "#closeTopSwimmersButton"
  );
  closeTopSwimmersButton.addEventListener("click", () => {
    dialog.remove();
  });

  const topSwimmersContent = dialog.querySelector("#topSwimmersContent");
  const topSwimmers = getTopSwimmersByTeam(team);

  Object.entries(topSwimmers).forEach(([discipline, swimmers]) => {
    const disciplineElement = document.createElement("div");
    disciplineElement.innerHTML = `<h3>${discipline}</h3>`;

    swimmers.forEach((swimmer, index) => {
      const swimmerElement = document.createElement("div");
      swimmerElement.innerText = `${index + 1}. ${swimmer.name} time: ${
        swimmer.resultTime
      }`;
      disciplineElement.appendChild(swimmerElement);
    });

    topSwimmersContent.appendChild(disciplineElement);
  });

  document.body.appendChild(dialog);
}

function getTopSwimmersByTeam(team) {
  const filteredResults = results.filter((result) => {
    const member = posts.find((post) => post.id === result.memberId);
    return member && member.team === team && result.type === "tournament";
  });

  const topSwimmers = {};

  filteredResults.forEach((result) => {
    if (!topSwimmers[result.discipline]) {
      topSwimmers[result.discipline] = [];
    }

    const member = posts.find((post) => post.id === result.memberId);

    if (member) {
      topSwimmers[result.discipline].push({
        name: member.name,
        resultTime: result.resultTime,
      });
    }
  });

  Object.entries(topSwimmers).forEach(([discipline, swimmers]) => {
    swimmers.sort((a, b) => {
      const aTime = convertToSeconds(a.resultTime);
      const bTime = convertToSeconds(b.resultTime);
      return aTime - bTime;
    });
    topSwimmers[discipline] = swimmers.slice(0, 5);
  });

  return topSwimmers;
}

function updateTopSwimmersDialog(team) {
  const topSwimmersContent = document.querySelector("#topSwimmersContent");
  topSwimmersContent.innerHTML = ""; 

  const topSwimmers = getTopSwimmersByTeam(team);

  Object.entries(topSwimmers).forEach(([discipline, swimmers]) => {
    const disciplineElement = document.createElement("div");
    disciplineElement.innerHTML = `<h3>${discipline}</h3>`;

    swimmers.forEach((swimmer, index) => {
      const swimmerElement = document.createElement("div");
      swimmerElement.innerText = `${index + 1}. ${swimmer.name} time: ${
        swimmer.resultTime
      }`;
      disciplineElement.appendChild(swimmerElement);
    });

    topSwimmersContent.appendChild(disciplineElement);
  });
}

function submitAddResultsForm(event) {
  event.preventDefault();

  const formContainer = document.getElementById("addResultsFormContainer");
  const memberId = formContainer.dataset.memberId;

  const resultType = document.getElementById("resultType").value;
  const discipline = document.getElementById("disciplineInput").value;
  const rankTime = document.getElementById("rankTimeInput").value;
  const date = document.getElementById("dateInput").value;

  const newResult = {
    id: generateResultId(),
    memberId: memberId,
    type: resultType,
    discipline: discipline,
    resultTime: rankTime,
    date: date,
  };

  results.push(newResult);
  console.log("New result successfully added:", newResult);

  const post = posts.find((post) => post.memberId === memberId);
  updateViewResultsDialog(memberId, post);

  const team = post?.team;
  if (team) {
    updateTopSwimmersDialog(team);
  }

  closeAddResultsForm();
}

function convertToSeconds(time) {
  const [minutes, seconds] = time.split(":").map(Number);
  return minutes * 60 + seconds;
}