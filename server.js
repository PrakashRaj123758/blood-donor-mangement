const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (Fixed)
mongoose.connect(
  "mongodb+srv://Prakashraj:prakashrajofficial@cluster0.u29garw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Mongoose Schemas
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

// ✅ API Routes
app.get("/", (req, res) => {
  res.send("🚀 Blood Bank API is running");
});

// --- Donors ---
app.post("/api/donors", async (req, res) => {
  try {
    const donor = new Donor(req.body);
    await donor.save();
    res.status(201).json({ message: "Donor added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add donor" });
  }
});

app.get("/api/donors", async (req, res) => {
  const donors = await Donor.find();
  res.json(donors);
});

// --- Recipients ---
app.post("/api/recipients", async (req, res) => {
  try {
    const recipient = new Recipient(req.body);
    await recipient.save();
    res.status(201).json({ message: "Recipient added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add recipient" });
  }
});

app.get("/api/recipients", async (req, res) => {
  const recipients = await Recipient.find();
  res.json(recipients);
});

// --- Hospitals ---
app.post("/api/hospitals", async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json({ message: "Hospital added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add hospital" });
  }
});

app.get("/api/hospitals", async (req, res) => {
  const hospitals = await Hospital.find();
  res.json(hospitals);
});

// --- Donor Transactions ---
app.post("/api/donor-transactions", async (req, res) => {
  try {
    const txn = new DonorTransaction(req.body);
    await txn.save();
    res.status(201).json({ message: "Donor transaction saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save donor transaction" });
  }
});

app.get("/api/donor-transactions", async (req, res) => {
  const txns = await DonorTransaction.find();
  res.json(txns);
});

// --- Recipient Transactions ---
app.post("/api/recipient-transactions", async (req, res) => {
  try {
    const txn = new RecipientTransaction(req.body);
    await txn.save();
    res.status(201).json({ message: "Recipient transaction saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save recipient transaction" });
  }
});

app.get("/api/recipient-transactions", async (req, res) => {
  const txns = await RecipientTransaction.find();
  res.json(txns);
});

// --- Blood Types ---
app.post("/api/blood-types", async (req, res) => {
  try {
    const bt = new BloodType(req.body);
    await bt.save();
    res.status(201).json({ message: "Blood Type saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save blood type" });
  }
});

app.get("/api/blood-types", async (req, res) => {
  const bloodTypes = await BloodType.find();
  res.json(bloodTypes);
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
