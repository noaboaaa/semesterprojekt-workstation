"use strict";

// ====================== Constants =========================== //

const endpoint = "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/";
let posts = [];

// ====================== Update Form Functions =========================== //

function closeUpdateForm() {
  document.querySelector("#updateFormContainer").style.display = "none";
}

function cancelUpdateForm() {
  const form = document.querySelector("#updateForm");
  form.reset();
  closeUpdateForm();
}

// ====================== Event Listeners =========================== //

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded event fired");
  initApp();

  document
    .querySelector("#open-register-dialog")
    .addEventListener("click", showRegistrationForm);
  document
    .querySelector("#close-register-dialog")
    .addEventListener("click", hideRegistrationForm);
  document
    .querySelector("#registration-form")
    .addEventListener("submit", registrationFormSubmitted);
  document
    .querySelector("#deletePostButton")
    .addEventListener("click", confirmDeletePost);
  document
    .querySelector("#deleteConfirmationYesButton")
    .addEventListener("click", deletePostConfirmed);
  document
    .querySelector("#deleteConfirmationNoButton")
    .addEventListener("click", cancelDeletePost);


  function calculateFee() {
    var age = parseInt(document.getElementById("age").value);
    var membershipType = document.getElementById("membershipType").value;
    var fee = 0;

    if (age > 18 && age < 60) {
      fee = 1600;
    } else if (age <= 18) {
      fee = 1000;
    } else if (age >= 60) {
      fee = 1200;
    }

    if (membershipType === "passive") {
      fee = 500;
    }

    document.getElementById("fee").value = fee;
  }

  var ageInput = document.getElementById("age");
  var membershipTypeSelect = document.getElementById("membershipType");
  var feeInput = document.createElement("input");
  feeInput.setAttribute("type", "number");
  feeInput.setAttribute("id", "fee");
  feeInput.setAttribute("name", "fee");
  feeInput.setAttribute("readonly", "true");

  var form = document.getElementById("registration-form");
  form.appendChild(feeInput);

  ageInput.addEventListener("input", calculateFee);
  membershipTypeSelect.addEventListener("change", calculateFee);
});

document.addEventListener("DOMContentLoaded", (event) => {

 
  document.querySelector("#age").addEventListener("input", handleAgeChange);
});

function handleAgeChange(event) {
  const ageInput = event.target;
  const teamSelect = document.querySelector("#team");

  if (ageInput.value !== "") {
    const age = parseInt(ageInput.value);
    teamSelect.value = age >= 18 ? "senior" : "junior";
  } else {
    teamSelect.value = "";
  }
}

// ====================== INITAPP =========================== //

function initApp() {
  console.log("App is running");
  updatePostsGrid();

  document
    .querySelector("#updateCancelButton")
    .addEventListener("click", cancelUpdateForm);
  document
    .querySelector("#updateForm")
    .addEventListener("submit", updateFormSubmitted);
}

// ====================== Get Posts =========================== //

async function getPosts() {
  const response = await fetch(`${endpoint}/posts.json`);
  const data = await response.json();
  const postObjects = Object.entries(data).map(([id, post]) => ({
    ...post,
    id,
  }));
  return postObjects;
}

async function updatePostsGrid() {
  try {
    posts = await getPosts();
    const postContainer = document.querySelector("#post-container");
    postContainer.innerHTML = "";

    posts.forEach((post, index) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.dataset.index = index;

      postElement.innerHTML = `
        <h2>${post.name}</h2>
        <p>Email: ${post.email}</p>
        <p>Age: ${post.age}</p>
        <p>Membership Type: ${post.membershipType}</p>
        <p>Swimmer Type: ${post.swimmerType}</p>
        <button class="update-btn">Update</button>
      `;

      postContainer.appendChild(postElement);
    });

    postContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("update-btn")) {
        const index = event.target.parentNode.dataset.index;
        openUpdateForm(posts[index]);
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

// ====================== Show/Hide Registration Form =========================== //

function showRegistrationForm() {
  document.querySelector("#register-dialog").showModal();
}

function hideRegistrationForm() {
  document.querySelector("#register-dialog").close();
}

// ====================== Registration Form Submit =========================== //

async function registrationFormSubmitted(event) {
  event.preventDefault();

  const form = document.querySelector("#registration-form");
  const formData = new FormData(form);

  const newPost = {
    name: formData.get("name"),
    email: formData.get("email"),
    age: formData.get("age"),
    membershipType: formData.get("membershipType"),
    swimmerType: formData.get("activity"),
  };

  try {
    await createPost(newPost);
    form.reset();
    hideRegistrationForm();
    updatePostsGrid();
    showRegisterSuccessPopup(); 
  } catch (error) {
    console.error("Error creating post:", error);
    showRegisterErrorPopup(); 
  }
}

async function createPost(postData) {
  const response = await fetch(`${endpoint}/posts.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error("Error creating post");
  }

  const data = await response.json();
  return data;
}

// ====================== UPDATE FORM =========================== //
async function updatePost(postData) {
  const postId = postData.id;
  const response = await fetch(`${endpoint}/posts/${postId}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error("Error updating post");
  }

  const data = await response.json();
  return data;
}
function openUpdateForm(post) {
  console.log(post);
  document.querySelector("#update-name").value = post.name;
  document.querySelector("#update-email").value = post.email;
  document.querySelector("#update-age").value = post.age;
  document.querySelector("#update-membershipType").value = post.membershipType;
  document.querySelector("#update-activity").value = post.swimmerType;

  document.querySelector("#updateForm").dataset.postId = post.id;

  document.querySelector("#updateFormContainer").style.display = "block";
}

async function updateFormSubmitted(event) {
  event.preventDefault();

  const form = document.querySelector("#updateForm");
  const formData = new FormData(form);

  const updatedPost = {
    id: document.querySelector("#updateForm").dataset.postId,
    name: document.querySelector("#update-name").value,
    email: document.querySelector("#update-email").value,
    age: document.querySelector("#update-age").value,
    membershipType: document.querySelector("#update-membershipType").value,
    swimmerType: document.querySelector("#update-activity").value,
  };

  try {
    await updatePost(updatedPost);
    form.reset();
    closeUpdateForm();
    updatePostsGrid();
    showUpdateSuccessPopup();
  } catch (error) {
    console.error("Error updating post:", error);
    showUpdateErrorPopup();
  }
}

// ===================DELETE POST===================== //
async function deletePost(postId) {
  try {
    await fetch(`${endpoint}/posts/${postId}.json`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    showDeleteErrorPopup();
  }
}

function confirmDeletePost() {
  const result = confirm("Are you sure you want to delete this post?");

  if (result) {
    const postId = document.querySelector("#updateForm").dataset.postId;
    deletePost(postId)
      .then(() => {
        updatePostsGrid();
        showDeleteSuccessPopup();
        closeUpdateForm();
      })
      .catch(() => {
        showDeleteErrorPopup();
      });
  } else {
    closeUpdateForm();
  }
}

function cancelDeletePost() {
  closeUpdateForm();
}

function deletePostConfirmed() {
  const postId = document.querySelector("#updateForm").dataset.postId;

  deletePost(postId)
    .then(() => {
      updatePostsGrid();
      showDeleteSuccessPopup();
      closeUpdateForm();
    })
    .catch(() => {
      showDeleteErrorPopup();
    });
}

function showDeleteSuccessPopup() {
  const successPopup = document.querySelector("#delete-success-popup");
  successPopup.classList.add("show");
  setTimeout(() => {
    successPopup.classList.remove("show");
  }, 2000);
}

function showDeleteErrorPopup() {
  const errorPopup = document.querySelector("#delete-error-popup");
  errorPopup.classList.add("show");
  setTimeout(() => {
    errorPopup.classList.remove("show");
  }, 2000);
}

// ====================== POP UPS =========================== //

async function registrationFormSubmitted(event) {
  event.preventDefault();

  const form = document.querySelector("#registration-form");
  const formData = new FormData(form);

  const newPost = {
    name: formData.get("name"),
    email: formData.get("email"),
    age: formData.get("age"),
    membershipType: formData.get("membershipType"),
    swimmerType: formData.get("activity"),
  };

  try {
    await createPost(newPost);
    form.reset();
    hideRegistrationForm();
    updatePostsGrid();
    showRegisterSuccessPopup(); 
  } catch (error) {
    console.error("Error creating post:", error);
    showRegisterErrorPopup(); 
  }
}

function showUpdateSuccessPopup() {
  const successPopup = document.querySelector("#update-success-popup");
  successPopup.classList.add("show");
  setTimeout(() => {
    successPopup.classList.remove("show");
  }, 2000);
}

function showUpdateErrorPopup() {
  const errorPopup = document.querySelector("#update-error-popup");
  errorPopup.classList.add("show");
  setTimeout(() => {
    errorPopup.classList.remove("show");
  }, 2000);
}

function showRegisterSuccessPopup() {
  const successPopup = document.querySelector("#register-success-popup");
  successPopup.classList.add("show");
  setTimeout(() => {
    successPopup.classList.remove("show");
  }, 2000);
}

function showRegisterErrorPopup() {
  const errorPopup = document.querySelector("#register-error-popup");
  errorPopup.classList.add("show");
  setTimeout(() => {
    errorPopup.classList.remove("show");
  }, 2000);
}

const successPopup = document.querySelector("#register-success-popup");
const errorPopup = document.querySelector("#register-error-popup");

function hidePopups() {
  successPopup.style.display = "none";
  errorPopup.style.display = "none";
}

// ====================== SEARCH N FILTER =========================== //
function filterPosts() {
  const filterField = document.querySelector("#filter-field").value;
  let filteredPosts = [];

  if (filterField === "active" || filterField === "passive") {
    filteredPosts = posts.filter(
      (post) => post.membershipType.toLowerCase() === filterField
    );
  } else if (filterField === "recreational" || filterField === "competitive") {
    filteredPosts = posts.filter(
      (post) => post.swimmerType.toLowerCase() === filterField
    );
  } else {
    filteredPosts = posts;
  }

  displayPosts(filteredPosts);
}

function displayPosts(posts) {
  const postContainer = document.querySelector("#post-container");
  postContainer.innerHTML = "";

  posts.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    postElement.dataset.index = index;

    postElement.innerHTML = `
      <h2>${post.name}</h2>
      <p>Email: ${post.email}</p>
      <p>Age: ${post.age}</p>
      <p>Membership Type: ${post.membershipType}</p>
      <p>Swimmer Type: ${post.swimmerType}</p>
      <button class="update-btn">Update</button>
    `;

    postContainer.appendChild(postElement);
  });
}
