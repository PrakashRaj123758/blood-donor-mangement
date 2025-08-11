// ================= Sidebar Navigation =================
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll(".page-section");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Stop page reload

            // Remove active from all links
            navLinks.forEach(l => l.classList.remove("active"));

            // Set active link
            link.classList.add("active");

            // Hide all sections
            sections.forEach(sec => sec.style.display = "none");

            // Show selected section
            const targetId = link.getAttribute("data-target");
            document.getElementById(targetId).style.display = "block";
        });
    });

    // Show dashboard on load
    document.getElementById("dashboard-section").style.display = "block";

    // Load initial data
    fetchBloodTypes();
    fetchHospitals();
    fetchDonors();
    fetchRecipients();
    fetchDonorTransactions();
    fetchRecipientTransactions();
});

// ================= Helper: Fetch Wrapper =================
async function fetchData(url) {
    const res = await fetch(url);
    return res.json();
}

// ================= Fetch & Render Functions =================
async function fetchBloodTypes() {
    const data = await fetchData("/api/blood-types");
    const tableBody = document.querySelector("#blood-types-table tbody");
    tableBody.innerHTML = "";
    data.forEach(bt => {
        tableBody.innerHTML += `
            <tr>
                <td>${bt.Blood_Type_ID}</td>
                <td>${bt.Name}</td>
            </tr>
        `;
    });
}

async function fetchHospitals() {
    const data = await fetchData("/api/hospitals");
    const tableBody = document.querySelector("#hospitals-table tbody");
    tableBody.innerHTML = "";
    data.forEach(h => {
        tableBody.innerHTML += `
            <tr>
                <td>${h.Hospital_ID}</td>
                <td>${h.Name}</td>
                <td>${h.Address}</td>
                <td>${h.Contact}</td>
            </tr>
        `;
    });
}

async function fetchDonors() {
    const data = await fetchData("/api/donors");
    const tableBody = document.querySelector("#donors-table tbody");
    tableBody.innerHTML = "";
    data.forEach(d => {
        tableBody.innerHTML += `
            <tr>
                <td>${d.Donor_ID}</td>
                <td>${d.Name}</td>
                <td>${d.Contact}</td>
                <td>${d.Age}</td>
                <td>${d.Blood_Type}</td>
                <td>${d.Card_ID}</td>
            </tr>
        `;
    });
}

async function fetchRecipients() {
    const data = await fetchData("/api/recipients");
    const tableBody = document.querySelector("#recipients-table tbody");
    tableBody.innerHTML = "";
    data.forEach(r => {
        tableBody.innerHTML += `
            <tr>
                <td>${r.Recipient_ID}</td>
                <td>${r.Name}</td>
                <td>${r.Contact}</td>
                <td>${r.Age}</td>
                <td>${r.Blood_Type}</td>
                <td>${r.Card_ID}</td>
            </tr>
        `;
    });
}

async function fetchDonorTransactions() {
    const data = await fetchData("/api/donor-transactions");
    const tableBody = document.querySelector("#donor-transactions-table tbody");
    tableBody.innerHTML = "";
    data.forEach(t => {
        tableBody.innerHTML += `
            <tr>
                <td>${t.Transaction_ID}</td>
                <td>${t.Donor_ID}</td>
                <td>${t.Hospital_ID}</td>
                <td>${t.Date}</td>
                <td>${t.Confirmation_Code}</td>
                <td>${t.Health_Status}</td>
            </tr>
        `;
    });
}

async function fetchRecipientTransactions() {
    const data = await fetchData("/api/recipient-transactions");
    const tableBody = document.querySelector("#recipient-transactions-table tbody");
    tableBody.innerHTML = "";
    data.forEach(t => {
        tableBody.innerHTML += `
            <tr>
                <td>${t.Transaction_ID}</td>
                <td>${t.Recipient_ID}</td>
                <td>${t.Hospital_ID}</td>
                <td>${t.Date}</td>
                <td>${t.Blood_Type}</td>
            </tr>
        `;
    });
}

// ================= Form Handling =================
document.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    let endpoint = "";
    if (form.id === "blood-type-form") endpoint = "/api/blood-types";
    if (form.id === "hospital-form") endpoint = "/api/hospitals";
    if (form.id === "donor-form") endpoint = "/api/donors";
    if (form.id === "recipient-form") endpoint = "/api/recipients";
    if (form.id === "donor-transaction-form") endpoint = "/api/donor-transactions";
    if (form.id === "recipient-transaction-form") endpoint = "/api/recipient-transactions";

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("✅ Data saved successfully");
        form.reset();

        // Refresh data after adding new record
        if (form.id === "blood-type-form") fetchBloodTypes();
        if (form.id === "hospital-form") fetchHospitals();
        if (form.id === "donor-form") fetchDonors();
        if (form.id === "recipient-form") fetchRecipients();
        if (form.id === "donor-transaction-form") fetchDonorTransactions();
        if (form.id === "recipient-transaction-form") fetchRecipientTransactions();
    } else {
        alert("❌ Failed to save data");
    }
});
