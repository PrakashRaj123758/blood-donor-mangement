const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static frontend from public/
app.use(express.static(path.join(__dirname, "")));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// === Schemas & Models ===
const donorSchema = new mongoose.Schema({
  Donor_ID: String,
  Name: String,
  Contact: String,
  Age: Number,
  Blood_Type: String,
  Card_ID: String,
});
const Donor = mongoose.model("Donor", donorSchema);

const recipientSchema = new mongoose.Schema({
  Recipient_ID: String,
  Name: String,
  Contact: String,
  Age: Number,
  Blood_Type: String,
  Card_ID: String,
});
const Recipient = mongoose.model("Recipient", recipientSchema);

const hospitalSchema = new mongoose.Schema({
  Hospital_ID: String,
  Name: String,
  Address: String,
  Contact: String,
});
const Hospital = mongoose.model("Hospital", hospitalSchema);

const donorTransactionSchema = new mongoose.Schema({
  Transaction_ID: String,
  Donor_ID: String,
  Hospital_ID: String,
  Date: String,
  Confirmation_Code: String,
  Health_Status: String,
});
const DonorTransaction = mongoose.model("DonorTransaction", donorTransactionSchema);

const recipientTransactionSchema = new mongoose.Schema({
  Transaction_ID: String,
  Recipient_ID: String,
  Hospital_ID: String,
  Date: String,
  Blood_Type: String,
});
const RecipientTransaction = mongoose.model("RecipientTransaction", recipientTransactionSchema);

const bloodTypeSchema = new mongoose.Schema({
  Blood_Type_ID: String,
  Name: String,
});
const BloodType = mongoose.model("BloodType", bloodTypeSchema);

// === API Routes ===
app.get("/api/donors", async (req, res) => {
  res.json(await Donor.find());
});

app.post("/api/donors", async (req, res) => {
  try {
    await new Donor(req.body).save();
    res.status(201).json({ message: "Donor added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add donor" });
  }
});

app.get("/api/recipients", async (req, res) => {
  res.json(await Recipient.find());
});

app.post("/api/recipients", async (req, res) => {
  try {
    await new Recipient(req.body).save();
    res.status(201).json({ message: "Recipient added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add recipient" });
  }
});

app.get("/api/hospitals", async (req, res) => {
  res.json(await Hospital.find());
});

app.post("/api/hospitals", async (req, res) => {
  try {
    await new Hospital(req.body).save();
    res.status(201).json({ message: "Hospital added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add hospital" });
  }
});

app.get("/api/donor-transactions", async (req, res) => {
  res.json(await DonorTransaction.find());
});

app.post("/api/donor-transactions", async (req, res) => {
  try {
    await new DonorTransaction(req.body).save();
    res.status(201).json({ message: "Donor transaction saved" });
  } catch {
    res.status(500).json({ error: "Failed to save donor transaction" });
  }
});

app.get("/api/recipient-transactions", async (req, res) => {
  res.json(await RecipientTransaction.find());
});

app.post("/api/recipient-transactions", async (req, res) => {
  try {
    await new RecipientTransaction(req.body).save();
    res.status(201).json({ message: "Recipient transaction saved" });
  } catch {
    res.status(500).json({ error: "Failed to save recipient transaction" });
  }
});

app.get("/api/blood-types", async (req, res) => {
  res.json(await BloodType.find());
});

app.post("/api/blood-types", async (req, res) => {
  try {
    await new BloodType(req.body).save();
    res.status(201).json({ message: "Blood Type saved" });
  } catch {
    res.status(500).json({ error: "Failed to save blood type" });
  }
});



// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
