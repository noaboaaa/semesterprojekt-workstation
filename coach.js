"use strict";

// ======================================= CONSTANTS ======================================= //

const endpoint = "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/";
let posts = [];
let results = [];

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded event fired");
  initApp();
  // Event listener for the dynamically generated button
  const postContainer = document.getElementById("post-container");
  postContainer.addEventListener("click", function (event) {
    // Check if the clicked element is the dynamically generated button
    if (event.target && event.target.id === "addResultsButton") {
      openAddResultsForm();
    }
  });
});

document.addEventListener("DOMContentLoaded", (event) => {
  const closeAddResultsButton = document.getElementById(
    "closeAddResultsButton"
  );
  const submitAddResultsButton = document.getElementById(
    "submitAddResultsButton"
  );

  closeAddResultsButton.addEventListener("click", closeAddResultsForm);
  submitAddResultsButton.addEventListener("click", submitAddResultsForm);
});

// ====================== INITAPP =========================== //

async function initApp() {
  console.log("App is running");
  await updatePostsGrid();
  await getResults();
}

// ======================================= GET POSTS ======================================= //

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

    // Filter posts to only include competitive swimmers
    const competitiveSwimmers = postObjects.filter(
      (post) => post.swimmerType === "competitive"
    );

    return competitiveSwimmers;
  } catch (error) {
    console.log("Error fetching posts:", error);
    return [];
  }
}

// ======================================= GET RESULTS ======================================= //

async function getResults() {
  try {
    const response = await fetch(`${endpoint}/results.json`);
    const data = await response.json();
    console.log("Fetched results in getResults:", data);

    if (data && Array.isArray(data)) {
      results = data.map((result, index) => ({
        id: "r" + (index + 1).toString().padStart(2, "0"),
        ...result,
      }));
      console.log("Transformed results:", results);
    } else {
      results = [];
      console.log("No results found in the response.");
    }

    return results;
  } catch (error) {
    console.log("Error fetching results:", error);
  }
}


// ======================================= UPDATE POST GRID ======================================= //

async function updatePostsGrid() {
  try {
    posts = await getPosts(); // Assign the fetched posts to the global 'posts' variable
    console.log("Fetched posts:", posts);

    const postContainer = document.querySelector("#post-container");
    postContainer.innerHTML = "";

    posts.forEach((post, index) => {
      console.log("Updating UI for post:", post);

      const postElement = document.createElement("div");
      postElement.classList.add("post");

      postElement.innerHTML = `
        <h2>${post.name}</h2>
        <p>Age: ${post.age}</p>
        <p>Team: ${post.team}</p>
        <button class="view-results">View Results</button>
        <button class="update-results">Add New Results</button>
      `;

      const viewResultsButton = postElement.querySelector(".view-results");
      const updateResultsButton = postElement.querySelector(".update-results");

      viewResultsButton.addEventListener("click", () => {
        openViewResultsDialog(post);
      });

     updateResultsButton.addEventListener("click", () => {
       openAddResultsForm(post.id); // Pass the post.id as the memberId
     });

      postContainer.appendChild(postElement);
    });

    console.log("Updated UI:", postContainer.innerHTML);
  } catch (error) {
    console.error("Error updating posts grid:", error);
  }
}



// ======================================= VIEW RESULTS DIALOG ======================================= //

async function openViewResultsDialog(post) {
  console.log("Opening View Results dialog for: ", post);

  const dialog = document.querySelector("#viewResultsDialog");
  const trainingResultsList = document.querySelector("#trainingResultsList");
  const tournamentResultsList = document.querySelector("#tournamentResultsList");

  // Clear the existing content
  trainingResultsList.innerHTML = "";
  tournamentResultsList.innerHTML = "";

  // Fetch the latest results data
  await getResults();

  // Get the results for the current post
  const postResults = results.filter((result) => result.memberId === post.id);

  // Separate the results into training and tournament
  const trainingResults = postResults.filter(
    (result) => result.type === "training"
  );
  const tournamentResults = postResults.filter(
    (result) => result.type === "tournament"
  );

  // Populate the training results
  trainingResults.forEach((result) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Discipline: ${result.discipline} | Result Time: ${result.resultTime} | Date: ${result.date}`;
    trainingResultsList.appendChild(listItem);
  });

  // Populate the tournament results
  tournamentResults.forEach((result) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Discipline: ${result.discipline} | Result Time: ${result.resultTime} | Date: ${result.date}`;
    tournamentResultsList.appendChild(listItem);
  });

  dialog.classList.remove("hidden");
  dialog.querySelector("h2").textContent = `Results for ${post.name}`;

  // Close dialog event listener
  const closeDialogButton = dialog.querySelector("#closeViewResultsButton");
  closeDialogButton.addEventListener("click", () => {
    dialog.classList.add("hidden");
  });
}



// ======================================= ADD NEW RESULTS FORM ======================================= //

function openAddResultsForm(memberId) {
  const formContainer = document.getElementById("addResultsFormContainer");
  formContainer.classList.remove("hidden");
  formContainer.dataset.memberId = memberId;
}


function closeAddResultsForm() {
  const formContainer = document.getElementById("addResultsFormContainer");
  formContainer.classList.add("hidden");
  resetAddResultsForm();
}

function resetAddResultsForm() {
  const form = document.getElementById("addResultsForm");
  form.reset();
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

  updateViewResultsDialog(memberId);
  closeAddResultsForm();
}


function generateResultId() {
  // Generate a unique result ID
  return "r" + (results.length + 1).toString().padStart(2, "0");
}

// ======================================= UPDATE VIEW RESULTS DIALOG ======================================= //

function updateViewResultsDialog(memberId) {
  const dialog = document.getElementById("viewResultsDialog");
  const trainingResultsList = dialog.querySelector("#trainingResultsList");
  const tournamentResultsList = dialog.querySelector("#tournamentResultsList");

  // Filter results by member ID
  const memberResults = results.filter(
    (result) => result.memberId === memberId
  );

  // Clear existing results
  trainingResultsList.innerHTML = "";
  tournamentResultsList.innerHTML = "";

  // Append results to the respective lists
  memberResults.forEach((result) => {
    const resultItem = document.createElement("li");
    resultItem.textContent = `Discipline: ${result.discipline} | Result Time: ${result.resultTime} | Date: ${result.date}`;

    if (result.type === "tournament") {
      tournamentResultsList.appendChild(resultItem);
    } else {
      trainingResultsList.appendChild(resultItem);
    }
  });
}

// ======================================= top five ======================================= //

// Event listeners for the filter buttons
document.getElementById("junior-filter-button").addEventListener("click", () => {
  openTopSwimmersDialog("junior");
});

document.getElementById("senior-filter-button").addEventListener("click", () => {
  openTopSwimmersDialog("senior");
});

function openTopSwimmersDialog(team) {
  const dialog = document.createElement("div");
  dialog.classList.add("dialog");
  dialog.id = "topSwimmersDialog";
  dialog.innerHTML = `
    <h2>Top Swimmers - ${team.charAt(0).toUpperCase() + team.slice(1)} Team</h2>
    <div id="topSwimmersContent"></div>
    <button id="closeTopSwimmersButton">Close</button>
  `;

  const closeTopSwimmersButton = dialog.querySelector("#closeTopSwimmersButton");
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
      swimmerElement.innerText = `${index + 1}. ${swimmer.name} time: ${swimmer.resultTime}`;
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
    swimmers.sort((a, b) => parseFloat(a.resultTime) - parseFloat(b.resultTime));
    topSwimmers[discipline] = swimmers.slice(0, 5);
  });

  return topSwimmers;
}

