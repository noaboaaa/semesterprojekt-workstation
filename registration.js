"use strict";

const endpoint = "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/";
let posts = [];

window.addEventListener("load", initApp);

//====================INITAPP==========================//

function initApp() {
  console.log("app is running");
  updatePostsGrid();

  //---------register--------//

  /*document
    .querySelector("#open-register-dialog")
    .addEventListener("click", showRegistrationForm);

  document
    .querySelector("#close-register-dialog")
    .addEventListener("click", hideRegistrationForm);

  document
    .querySelector("#registration-form")
    .addEventListener("submit", registrationFormSubmitted);*/

  //---------update form --------//
  document
    .getElementById("updateForm")
    .addEventListener("submit", updateFormSubmitted);

  document
    .getElementById("updateCloseBtn")
    .addEventListener("click", closeUpdateForm);

    
}

// ====================== get members =========================== //
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
    const postContainer = document.getElementById("post-container");

    // Clear the post container
    postContainer.innerHTML = "";

    // Iterate over each post in the data
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");

      // Set the content of the post element using the desired properties
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

    // Add event listeners to the update buttons
    const updateButtons = document.querySelectorAll(".update-btn");
    updateButtons.forEach((button, index) => {
      button.addEventListener("click", () => openUpdateForm(posts[index]));
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function openUpdateForm(post) {
  // Populate the form fields with the current post data
  document.getElementById("update-name").value = post.name;
  document.getElementById("update-email").value = post.email;
  document.getElementById("update-age").value = post.age;
  document.getElementById("update-membershipType").value = post.membershipType;
  document.getElementById("update-activity").value = post.swimmerType;
  // Add any other fields as needed

  // Store the post ID in a data attribute for later use
  document.getElementById("updateForm").dataset.postId = post.id;

  // Display the form
  document.getElementById("updateFormContainer").style.display = "block";
}

async function updateFormSubmitted(event) {
  event.preventDefault();

  // Get the updated data from the form fields
  const updatedPost = {
    id: document.getElementById("updateForm").dataset.postId,
    name: document.getElementById("update-name").value,
    email: document.getElementById("update-email").value,
    age: document.getElementById("update-age").value,
    membershipType: document.getElementById("update-membershipType").value,
    swimmerType: document.getElementById("update-activity").value,
    // Add any other fields as needed
  };

  // Call the updatePost function to update the post data
  await updatePost(updatedPost);

  // Close the update form
  closeUpdateForm();
}

function closeUpdateForm() {
  document.getElementById("updateFormContainer").style.display = "none";
}

async function updatePost(updatedPost) {
  // Here, add the code to send a request to your backend to update the post data.
  // The specific way to do this will depend on your backend.

  // After the post data has been updated, refresh the posts grid:
  updatePostsGrid();
}
