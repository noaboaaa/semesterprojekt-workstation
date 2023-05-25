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

async function getResults(memberId) {
  try {
    const response = await fetch(`${endpoint}/results.json`);
    const data = await response.json();
    console.log("Fetched results in getResults:", data);

    if (data && Array.isArray(data)) {
      results = data.map((result, index) => ({
        id: "r" + (index + 1).toString().padStart(2, "0"),
        ...result,
      }));

      if (memberId) {
        results = results.filter((result) => result.memberId === memberId);
      }

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
       openAddResultsForm(post.memberId); // Pass the post.id as the memberId
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
const postResults = results.filter((result) => result.memberId === post.memberId);

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
async function submitAddResultsForm(event) {
  event.preventDefault();

  // gather data from the form
  const resultType = document.getElementById("resultType").value;
  const discipline = document.getElementById("disciplineInput").value;
  const rankTime = document.getElementById("rankTimeInput").value;
  const date = document.getElementById("dateInput").value;

  const formContainer = document.getElementById("addResultsFormContainer");
  const memberId = formContainer.dataset.memberId;

  // here we create an object for the new result
  // here we create an object for the new result
  const newResult = {
    id: generateResultId(),
    memberId: formContainer.dataset.memberId,
    type: resultType,
    discipline: discipline,
    resultTime: rankTime,
    date: date,
    // other fields here...
  };

  // New fetch request syntax
  try {
    const response = await fetch(`${endpoint}/results.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newResult),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    console.log("Result submitted successfully:", json);

    // Close the form
    closeAddResultsForm();

    // Update the results
    await getResults();

    // Update the view results dialog
    updateViewResultsDialog(memberId);
  } catch (error) {
    console.log("There was an error: " + error.message);
  }
}


function generateResultId() {
  if (results.length > 0) {
    const lastResult = results[results.length - 1];
    const lastIdNum = parseInt(lastResult.id.slice(1)); // Assuming the id is in the format "rXX"
    const newIdNum = lastIdNum + 1;
    const newId = "r" + newIdNum.toString().padStart(2, "0");
    return newId;
  } else {
    return "r01";
  }
}


function updateViewResultsDialog(memberId, post) {
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

  openViewResultsDialog(memberId, post);
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

// ===================== update top five swimmers ========================= //

function updateTopSwimmersDialog(team) {
  const topSwimmersContent = document.querySelector("#topSwimmersContent");
  topSwimmersContent.innerHTML = ""; // Clear the existing content

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

  // Find the post associated with the memberId
  const post = posts.find((post) => post.id === memberId);

  // Update the view results dialog with the new result
  updateViewResultsDialog(memberId, post);

  // Update the top swimmers dialog
  const team = post?.team;
  if (team) {
    updateTopSwimmersDialog(team);
  }

  closeAddResultsForm();
}




