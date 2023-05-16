"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const endpoint = "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/";

  // Function to display members
  function displayMembers(members) {
    const membersContainer = document.getElementById("membersContainer");
    membersContainer.innerHTML = ""; // Clear the container

    members.forEach((member) => {
      const memberCard = document.createElement("div");
      memberCard.className = "member";
      memberCard.dataset.id = member.id; // Save the id in the HTML for later use

      const name = document.createElement("h3");
      name.textContent = member.name;
      memberCard.appendChild(name);

      const age = document.createElement("p");
      age.textContent = "Age: " + member.age;
      memberCard.appendChild(age);

      const email = document.createElement("p");
      email.textContent = "Email: " + member.email;
      memberCard.appendChild(email);

      const membershipType = document.createElement("p");
      membershipType.textContent = "Membership Type: " + member.membershipType;
      memberCard.appendChild(membershipType);

      const swimmerType = document.createElement("p");
      swimmerType.textContent = "Swimmer Type: " + member.swimmerType;
      memberCard.appendChild(swimmerType);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-button";
      memberCard.appendChild(deleteButton);

      console.log(deleteButton); // Debugging log

      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";
      updateButton.className = "update-button";
     
      updateButton.addEventListener("click", () => openUpdateForm(member));
      memberCard.appendChild(updateButton);


      membersContainer.appendChild(memberCard);
    });
  }

  // Open the update form and populate it with the member's data
  function openUpdateForm(member) {
    // Fill in the form with the member's data
    document.getElementById("update-name").value = member.name;
    document.getElementById("update-age").value = member.age;
    document.getElementById("update-email").value = member.email;
    document.getElementById("update-membershipType").value =
      member.membershipType;
    document.getElementById("update-activity").value = member.swimmerType;
    // Save the member's id in the form for later use
    document.getElementById("updateForm").dataset.id = member.id;
    // Show the form
    document.getElementById("updateForm").style.display = "block";
  }

  async function updateMember(event) {
    event.preventDefault();

    const form = document.getElementById("updateForm");
    const memberId = form.dataset.id;

    const memberData = {
      name: document.getElementById("update-name").value,
      age: document.getElementById("update-age").value,
      email: document.getElementById("update-email").value,
      membershipType: document.getElementById("update-membershipType").value,
      swimmerType: document.getElementById("update-activity").value,
    };

    const response = await fetch(`${endpoint}/members/${memberId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      alert("Failed to update member");
    }

    fetchMembers();
    form.style.display = "none";
  }

   document
     .getElementById("updateForm")
     .addEventListener("submit", updateMember);

  // Fetch members from Firebase
async function fetchMembers() {
  const response = await fetch(`${endpoint}/members.json`);
  const data = await response.json();

  console.log("Fetched data:", data); // Debugging log

  const members = Object.entries(data || []).map(([id, memberData]) => ({
    id,
    ...memberData,
  }));

  console.log("Mapped members:", members); // Debugging log

  displayMembers(members);
}
  // Initial fetch
  fetchMembers();
});