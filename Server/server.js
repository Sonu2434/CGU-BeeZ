let express = require("express");
let mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
let app = express();

app.use(cors({ origin: "http://127.0.0.1:5501" })); // FRONTEND
app.use(express.json());

// ─── DB CONNECTION ────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://UserDatabase:Ankit966@userdb.pamhqez.mongodb.net/?appName=UserDB"
    );
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Connection Failed:", error.message);
  }
};
connectDB();

// ─── USER SCHEMA ─────────────────────────────────────────────────────────────
let userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  confpassword: String,
});
let UserModel = mongoose.model("userdatas", userSchema);

// ─── PDF / PAPER SCHEMA  (STEP 1: updated fields) ────────────────────────────
/*
  OLD schema had only:  { name, file }
  NEW schema stores:    { title, branch, subject, year, downloads, file, originalName }
*/
const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  branch: { type: String, default: "N/A" },
  subject: { type: String, default: "N/A" },
  year: { type: String, default: "N/A" },
  downloads: { type: Number, default: 0 },
  file: { type: Buffer, required: true },
  originalName: { type: String },
});
const PDF = mongoose.model("PDF", pdfSchema);

// ─── MULTER (memory storage) ──────────────────────────────────────────────────


const storage = multer.memoryStorage();
 const upload = multer({ storage });
//DUPLICATE 




// ─────────────────────────────────────────────────────────────────────────────
//  USER ROUTES  (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

// Middleware: block duplicate accounts
async function CheckingUser(req, resp, next) {
  let existing = await UserModel.findOne({ email: req.body.email });
  if (existing) {
    resp.send("Account already exist");
  } else {
    next();
  }
}

// Create User
app.post("/Signup", CheckingUser,async (req, res) => {
  try {
    
      const DataSet = req.body;
      console.log(DataSet);
       let data= new UserModel(DataSet);
       await data.save()
    res.send("Received-Data")
  } catch (error) {
    res.send("Error:400");
  }
});

//------------LOGIN PASSWORD---------------

//------------LOGIN API---------------

app.post("/Login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // find user
    let user = await UserModel.findOne({ email: email });

    if (!user) {
      res.send("User not found");
      return
    }

    // check password
    if (user.password !== password) {
      res.send("Wrong password");
      return
    }

    //----Taking user First name--------------
    
const fullName = user.name;
let firstName = fullName.split(" ")[0];
    res.send(firstName);
//-------------------------------------------
  } catch (error) {
console.log(error)
    res.send("Login Error");

  }

});


//|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// POST /Signup
// app.post("/Signup", CheckingUser, async (req, res) => {
//   try {
//     const data = new UserModel(req.body);
//     await data.save();
//     res.send("Received-Data");
//   } catch (error) {
//     res.send("Error:400");
//   }
// });

// // POST /Login
// app.post("/Login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     let user = await UserModel.findOne({ email });
//     if (!user) return res.send("User not found");
//     if (user.password !== password) return res.send("Wrong password");

//     const firstName = user.name.split(" ")[0];
//     res.send(firstName);
//   } catch (error) {
//     res.send("Login Error");
//   }
// });

// ─────────────────────────────────────────────────────────────────────────────
//  PAPER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── STEP 2: POST /upload ─────────────────────────────────────────────────────
/*
  Admin sends a multipart/form-data request with:
    - pdf      : the PDF file (file field)
    - title    : e.g. "Data Structures"
    - branch   : e.g. "CSE"
    - subject  : e.g. "DSA"
    - year     : e.g. "2024"

  All extra fields are now stored alongside the binary file.
*/
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const { title, branch, subject, year } = req.body;

    if (!req.file) return res.status(400).send("No PDF file uploaded.");
    if (!title) return res.status(400).send("Title is required.");

    const newPdf = new PDF({
      title,
      branch: branch || "N/A",
      subject: subject || "N/A",
      year: year || "N/A",
      downloads: 0,
      file: req.file.buffer,
      originalName: req.file.originalname,
    });

    await newPdf.save();
    res.send("PDF Uploaded");
  } catch (err) {
    console.error("Upload error:", err);
   res.status(500).send("Upload failed.");
   }
 });

// ── STEP 3: GET /papers ───────────────────────────────────────────────────────
/*
  Returns all papers WITHOUT the binary file field (keeps response small).
  Frontend uses _id to build the download URL: /download/:id
  Example response:
  [
    { _id: "abc123", title: "DSA", branch: "CSE", subject: "DSA", year: "2024", downloads: 0 }
  ]
*/
app.get("/papers", async (req, res) => {
  try {
    // "-file" excludes the heavy Buffer from the response
    const papers = await PDF.find({}, "-file");
    res.json(papers);
  } catch (err) {
    console.error("Fetch papers error:", err);
    res.status(500).json({ error: "Could not fetch papers." });
  }
});

// ── STEP 5: GET /download/:id ─────────────────────────────────────────────────
/*
  Streams the binary PDF back to the browser.
  Also increments the downloads counter atomically.
*/
app.get("/download/:id", async (req, res) => {
  try {
    const file = await PDF.findById(req.params.id);
    if (!file) return res.status(404).send("Paper not found.");

    // Increment downloads in DB
    await PDF.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.originalName || file.title + ".pdf"}"`,
    });
    res.send(file.file);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Download failed.");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(8900, () => {
  console.log("Server started on port 8900");
});
