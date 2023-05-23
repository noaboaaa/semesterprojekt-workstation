"use strict";

// ====================== Constants =========================== //
const endpoint =
  "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/posts.json";
let posts = [];

// ====================== Event Listeners =========================== //
// Search Functionality
document.getElementById("search-input").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const tableRows = document.querySelectorAll("#table-body tr");
  tableRows.forEach((row) => {
    const rowText = row.textContent.toLowerCase();
    if (rowText.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

// Filter Functionality
document
  .getElementById("filter-select")
  .addEventListener("change", function () {
    const filterValue = this.value.toLowerCase();
    const tableRows = document.querySelectorAll("#table-body tr");
    tableRows.forEach((row) => {
      const paymentStatus = row.cells[2].textContent.toLowerCase();
      if (filterValue === "" || paymentStatus === filterValue) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

// ====================== INITAPP =========================== //
function initApp() {
  console.log("App is running");

  // Fetch data
  fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); // Check the logged data
      // Transform the data into an array
      posts = Object.entries(data).map(([id, post]) => ({
        ...post,
        id,
      }));

      // Populate the table
      const tbody = document.getElementById("table-body");
      let totalIncome = 0;
      posts.forEach((post) => {
        // Check payment status and add to total income
        if (post.paymentStatus === "paid") {
          totalIncome += post.annualFee;
        }

        // Create a new row
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${post.name}</td>
          <td>${post.annualFee}</td>
          <td>${post.paymentStatus}</td>
          <td><button class="payment-button">${
            post.paymentStatus === "paid" ? "Unpay" : "Pay"
          }</button></td>
        `;
        // Append the row to the table body
        tbody.appendChild(tr);

        // Add event listener to the payment button
        const button = tr.querySelector(".payment-button");
        button.addEventListener("click", () => {
          // Determine the new payment status
          const newPaymentStatus =
            post.paymentStatus === "paid" ? "unpaid" : "paid";

          // Send the update to the server
          fetch(
            `https://restinpeace-4a0bb-default-rtdb.firebaseio.com/posts/${post.id}.json`,
            {
              method: "PATCH",
              body: JSON.stringify({ paymentStatus: newPaymentStatus }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => {
              if (!response.ok) throw new Error("Network response was not ok");
              return response.json();
            })
            .then((data) => {
              // Update the payment status in the local data and table
              post.paymentStatus = newPaymentStatus;
              button.textContent =
                post.paymentStatus === "paid" ? "Unpay" : "Pay";
              tr.children[2].textContent = post.paymentStatus;
              
              // Recalculate the total income
              totalIncome = posts.reduce(
                (total, post) =>
                  total + (post.paymentStatus === "paid" ? post.annualFee : 0),
                0
              );
              // Update the total income display
              document.getElementById("annual-income").innerText =
                totalIncome + ",-";
            })
            .catch((error) => console.error("Error:", error));
        });
      });

      // Display the total income
      document.getElementById("annual-income").innerText = totalIncome + ",-";
    })
    .catch((error) => console.error("Error:", error));
}

// Call the initApp function when the page loads
window.onload = initApp;
