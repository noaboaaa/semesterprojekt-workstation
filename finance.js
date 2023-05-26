"use strict";

// ====================== Constants =========================== //
const endpoint =
  "https://restinpeace-4a0bb-default-rtdb.firebaseio.com/posts.json";
let posts = [];

// ====================== Event Listeners =========================== //
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

  fetch(endpoint)
    .then((response) => response.json())
    .then((data) => {
      console.log(data); 
      posts = Object.entries(data).map(([id, post]) => ({
        ...post,
        id,
      }));

      const tbody = document.getElementById("table-body");
      let totalIncome = 0;
      posts.forEach((post) => {
        if (post.paymentStatus === "paid") {
          totalIncome += post.annualFee;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${post.name}</td>
          <td>${post.annualFee}</td>
          <td>${post.paymentStatus}</td>
          <td><button class="payment-button">${
            post.paymentStatus === "paid" ? "Unpay" : "Pay"
          }</button></td>
        `;
        tbody.appendChild(tr);

        const button = tr.querySelector(".payment-button");
        button.addEventListener("click", () => {
          const newPaymentStatus =
            post.paymentStatus === "paid" ? "unpaid" : "paid";

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
              post.paymentStatus = newPaymentStatus;
              button.textContent =
                post.paymentStatus === "paid" ? "Unpay" : "Pay";
              tr.children[2].textContent = post.paymentStatus;
              
              totalIncome = posts.reduce(
                (total, post) =>
                  total + (post.paymentStatus === "paid" ? post.annualFee : 0),
                0
              );
              document.getElementById("annual-income").innerText =
                totalIncome + ",-";
            })
            .catch((error) => console.error("Error:", error));
        });
      });

      document.getElementById("annual-income").innerText = totalIncome + ",-";
    })
    .catch((error) => console.error("Error:", error));
}

window.onload = initApp;
