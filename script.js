// DOM Elements
const donorForm = document.getElementById("donorForm");
const recipientForm = document.getElementById("recipientForm");
const hospitalForm = document.getElementById("hospitalForm");

const donorList = document.getElementById("donorList");
const recipientList = document.getElementById("recipientList");
const hospitalList = document.getElementById("hospitalList");

// ===================== DONORS =====================

// Fetch and display donors
function fetchDonors() {
    fetch("/api/donors")
        .then(res => res.json())
        .then(data => {
            donorList.innerHTML = "";
            data.forEach(donor => {
                const li = document.createElement("li");
                li.textContent = `${donor.Name} - ${donor.Blood_Type}`;
                donorList.appendChild(li);
            });
        })
        .catch(err => console.error("Error fetching donors:", err));
}

// Add donor from form
if (donorForm) {
    donorForm.addEventListener("submit", e => {
        e.preventDefault();
        const donorData = {
            Donor_ID: donorForm.Donor_ID.value,
            Name: donorForm.Name.value,
            Contact: donorForm.Contact.value,
            Age: donorForm.Age.value,
            Blood_Type: donorForm.Blood_Type.value,
            Card_ID: donorForm.Card_ID.value
        };
        fetch("/api/donors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(donorData)
        })
            .then(res => res.json())
            .then(() => {
                donorForm.reset();
                fetchDonors();
            })
            .catch(err => console.error("Error adding donor:", err));
    });
}

// ===================== RECIPIENTS =====================

function fetchRecipients() {
    fetch("/api/recipients")
        .then(res => res.json())
        .then(data => {
            recipientList.innerHTML = "";
            data.forEach(recipient => {
                const li = document.createElement("li");
                li.textContent = `${recipient.Name} - ${recipient.Blood_Type}`;
                recipientList.appendChild(li);
            });
        })
        .catch(err => console.error("Error fetching recipients:", err));
}

if (recipientForm) {
    recipientForm.addEventListener("submit", e => {
        e.preventDefault();
        const recipientData = {
            Recipient_ID: recipientForm.Recipient_ID.value,
            Name: recipientForm.Name.value,
            Contact: recipientForm.Contact.value,
            Age: recipientForm.Age.value,
            Blood_Type: recipientForm.Blood_Type.value,
            Card_ID: recipientForm.Card_ID.value
        };
        fetch("/api/recipients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recipientData)
        })
            .then(res => res.json())
            .then(() => {
                recipientForm.reset();
                fetchRecipients();
            })
            .catch(err => console.error("Error adding recipient:", err));
    });
}

// ===================== HOSPITALS =====================

function fetchHospitals() {
    fetch("/api/hospitals")
        .then(res => res.json())
        .then(data => {
            hospitalList.innerHTML = "";
            data.forEach(hospital => {
                const li = document.createElement("li");
                li.textContent = `${hospital.Name} - ${hospital.Address}`;
                hospitalList.appendChild(li);
            });
        })
        .catch(err => console.error("Error fetching hospitals:", err));
}

if (hospitalForm) {
    hospitalForm.addEventListener("submit", e => {
        e.preventDefault();
        const hospitalData = {
            Hospital_ID: hospitalForm.Hospital_ID.value,
            Name: hospitalForm.Name.value,
            Address: hospitalForm.Address.value,
            Contact: hospitalForm.Contact.value
        };
        fetch("/api/hospitals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hospitalData)
        })
            .then(res => res.json())
            .then(() => {
                hospitalForm.reset();
                fetchHospitals();
            })
            .catch(err => console.error("Error adding hospital:", err));
    });
}

// ===================== INITIAL LOAD =====================
document.addEventListener("DOMContentLoaded", () => {
    fetchDonors();
    fetchRecipients();
    fetchHospitals();
});
