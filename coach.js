"use strict";

// ======================================= CONSTANTS ======================================= //

const endpoint = "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/";
let posts = [];
let results = [];

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded event fired");
  initApp();

  // Event listener for the dynamically generated "update-results" button
  const postContainer = document.getElementById("post-container");
  postContainer.addEventListener("click", function (event) {
    // Check if the clicked element is the dynamically generated button
    if (event.target && event.target.classList.contains("update-results")) {
      const postElement = event.target.closest(".post");
      const memberId = postElement.dataset.memberId;
      openUpdateResultsForm(memberId);
    }
  });

  // Event listener for the update results form
  document
    .querySelector("#updateResultsForm form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const type = document.querySelector("#updateType").value;
      const discipline = document.querySelector("#updateDiscipline").value;
      const resultTime = document.querySelector("#updateResultTime").value;
      const date = document.querySelector("#updateDate").value;

      const result = {
        type,
        discipline,
        resultTime,
        date,
      };

      updateResult(result);
    });

  // Event listener for closing the update results form
  document
    .querySelector("#closeUpdateResultsForm")
    .addEventListener("click", function () {
      document.querySelector("#updateResultsForm").style.display = "none";
    });
});

// ====================== INITAPP =========================== //

async function initApp() {
  console.log("App is running");
  await Promise.all([getPosts(), getResults()]);
  updatePostsGrid();
}

// ======================================= UPDATE POST GRID ======================================= //

async function updatePostsGrid() {
  try {
    posts = await getPosts(); // Assign the fetched posts to the global 'posts' variable
    console.log("Fetched posts:", posts);

    const postContainer = document.querySelector("#post-container");
    postContainer.innerHTML = "";

    // Fetch and log the results
    await getResults();
    console.log("Fetched results:", results);

    posts.forEach((post, index) => {
      console.log("Updating UI for post:", post);

      const postElement = document.createElement("div");
      postElement.classList.add("post");

      // Get the results for the current post
      const postResults = results.filter(
        (result) => result.memberId === post.memberId
      );

      // Build results HTML
      let resultsHTML = "";
      postResults.forEach((result) => {
        resultsHTML += `<p>${result.type} Result - Discipline: ${result.discipline} | Result Time: ${result.resultTime} | Date: ${result.date} <button class="update-result" data-result-id="${result.id}">Update</button></p>`;
      });

      postElement.innerHTML = `
        <h2>${post.name}</h2>
        <p>Age: ${post.age}</p>
        <p>Team: ${post.team}</p>
        ${resultsHTML}
      `;

      const updateResultButtons =
        postElement.querySelectorAll(".update-result");
      updateResultButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const resultId = button.getAttribute("data-result-id");
          openUpdateResultsForm(resultId);
        });
      });

      postContainer.appendChild(postElement);
    });

    console.log("Updated UI:", postContainer.innerHTML);
  } catch (error) {
    console.error("Error updating posts grid:", error);
  }
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
    results = Object.entries(data).map(([id, result]) => ({
      id,
      ...result,
    }));
    console.log("Results:", results);
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}

// ======================================= UPDATE RESULTS FORM ======================================= //

document
  .querySelector("#updateResultsForm form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const type = document.querySelector("#updateType").value;
    const discipline = document.querySelector("#updateDiscipline").value;
    const resultTime = document.querySelector("#updateResultTime").value;
    const date = document.querySelector("#updateDate").value;

    const result = {
      type,
      discipline,
      resultTime,
      date,
    };

    updateResult(result);
  });

// ======================================= OPEN UPDATE RESULTS FORM ======================================= //
function openUpdateResultsForm(memberId) {
  // Filter the results based on the member ID
  const memberResults = results.filter(
    (result) => result.memberId === memberId
  );

  // Iterate over the member's results and display them in the form
  memberResults.forEach((result) => {
    // Load the result data into the form
    const resultContainer = document.createElement("div");
    resultContainer.innerHTML = `
      <p>${result.type} Result - Discipline: ${result.discipline} | Result Time: ${result.resultTime} | Date: ${result.date}</p>
      <button class="update-result" data-member-id="${result.memberId}" data-result-id="${result.id}">Update</button>
    `;
    document.querySelector("#updateResultsForm").appendChild(resultContainer);
  });

  // Show the form
  document.querySelector("#updateResultsForm").style.display = "block";
}


// ======================================= UPDATE RESULTS ======================================= //

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

    // Update the local results array and posts grid
    const index = results.findIndex((result) => result.memberId === memberId && result.id === resultId);
    results[index] = result;
    updatePostsGrid();
  } catch (error) {
    console.error("Error updating result:", error);
  }
}

// ======================================= CLOSE UPDATE RESULTS FORM ======================================= //

document
  .querySelector("#closeUpdateResultsForm")
  .addEventListener("click", function () {
    document.querySelector("#updateResultsForm").style.display = "none";
  });

// ======================================= UPDATE UI ======================================= //

posts.forEach((post, index) => {
  // ...
  // Get the results for the current post
  const postResults = results.filter(
    (result) => result.memberId === post.memberId
  );

  // ...
  postResults.forEach((result) => {
    // Add an "Update Result" button for each result
    resultsHTML += `<button class="update-results" data-member-id="${post.memberId}" data-result-id="${result.id}">Update Result</button>`;
  });

  // ...

  const updateResultsButton = postElement.querySelector(".update-results");
  updateResultsButton.addEventListener("click", () => {
    // Retrieve the member ID and result ID from the button's data attributes
    const memberId = updateResultsButton.dataset.memberId;
    const resultId = updateResultsButton.dataset.resultId;
    openUpdateResultsForm(memberId, resultId);
  });

  // ...
});


/*
function openAddResultsForm(memberId) {
  const form = document.querySelector("#addResultsForm");
  form.dataset.postId = memberId; // Set the post id on the form to use when submitting
  document.querySelector("#addResultsFormContainer").classList.remove("hidden");
}

function closeAddResultsForm() {
  document.querySelector("#addResultsFormContainer").classList.add("hidden");
}

async function submitAddResultsForm(event) {
  event.preventDefault();

  const form = document.querySelector("#addResultsForm");
  const memberId = form.dataset.postId;
  const type = document.querySelector("#resultType").value;
  const discipline = document.querySelector("#disciplineInput").value;
  const rankTime = document.querySelector("#rankTimeInput").value;
  const date = document.querySelector("#dateInput").value;

  // Construct the new result object
  const newResult = {
    memberId,
    type,
    discipline,
    rankTime,
    date,
  };

  try {
    // Add the new result to the Firebase database
    const response = await fetch(`${endpoint}/results.json`, {
      method: "POST",
      body: JSON.stringify(newResult),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }

    // Get the id of the new result from the response
    const data = await response.json();
    const newResultId = data.name;

    // Add the id to the new result object and add it to the 'results' array
    newResult.id = newResultId;
    results.push(newResult);

    console.log("New result added:", newResult);

    // Close the form
    closeAddResultsForm();

    // Update the posts grid to reflect the new result
    updatePostsGrid();
  } catch (error) {
    console.error("Error adding new result:", error);
  }
}

// ======================================= top five ======================================= //

// Event listeners for the filter buttons

/*
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
    swimmers.sort(
      (a, b) => parseFloat(a.resultTime) - parseFloat(b.resultTime)
    );
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

  // Find the post associated with the memberId
  const post = posts.find((post) => post.memberId === memberId);

  // Update the view results dialog with the new result
  updateViewResultsDialog(memberId, post);

  // Update the top swimmers dialog
  const team = post?.team;
  if (team) {
    updateTopSwimmersDialog(team);
  }

  closeAddResultsForm();
}
*/
