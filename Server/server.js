let express = require("express");
let mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
let app = express();

app.use(cors({ origin: "https://cgu-beez-kdm9whxfp-webcreator.vercel.app" })); // FRONTEND
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

let countDoc_Pdf=new mongoose.Schema({
  counterSignup:Number,
  counterPdf:Number,
  DBcounter:Number
})
let Doc_PdfModel=mongoose.model("Doc-PdfCounter",countDoc_Pdf)
let N=1
let UserModel=mongoose.model("userdatas-"+1, userSchema);

function recall(){
async function DBnumber(){
 let finder= await Doc_PdfModel.findOne( { _id:  new mongoose.Types.ObjectId("69b44c1e461f01e3fd47378d")});
 return finder
}
DBnumber().then((RESP)=>{
  
  N=RESP.DBcounter
  console.log(N)
 UserModel = mongoose.model("userdatas-"+N, userSchema);

})

}
// ─── PDF / PAPER SCHEMA  (STEP 1: updated fields) ────────────────────────────
/*
  OLD schema had only:  { name, file }
  NEW schema stores:    { title, branch, subject, year, downloads, file, originalName }
*/
// FOR COUNTING COLLECTION DOCUMENTS
//------------------------------------------------
// FOR COUNTING PDFs

// async function f(){
//   let e=await new Doc_PdfModel({
//      counterSignup:0,
//   counterPdf:0,
//   DBcounter:0
//   })  
//   e.save()   
// }
// f()

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
async function CheckingUser(req, res, next) {

  const email = req.body.email;
  const db = mongoose.connection.db;

  const cols = await db.listCollections().toArray();

  const userCols = cols.filter(c => c.name.startsWith("userdatas-"));

  for (const col of userCols) {

    const exist = await db.collection(col.name).findOne({ email });

    if (exist) {
      return res.send("Account already exist");
    }

  }

  next();
}

// Create User

app.post("/Signup", CheckingUser,async (req, res) => {
  
  try {
    const DataSet = req.body;
    console.log(DataSet);
    let data= new UserModel(DataSet);
    await data.save()
    let counter=   await UserModel.countDocuments()
    if(counter==100){
      await Doc_PdfModel.updateOne(  
        { _id:  new mongoose.Types.ObjectId("69b44c1e461f01e3fd47378d")},
        { $inc: { DBcounter: 1 } }
      );
      
    }

    let count=   await UserModel.countDocuments()//userdatas x DBcounter
    await Doc_PdfModel.updateOne(  
    { _id:  new mongoose.Types.ObjectId("69b44c1e461f01e3fd47378d")},
    { $set: { counterSignup:count} }
    );
    recall()
    res.send("Received-Data");
  } catch (error) {
    res.send("Error:400");
  }
});

//------------LOGIN PASSWORD---------------


//------------LOGIN API---------------

app.post("/Login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const db = mongoose.connection.db;

    const cols = await db.listCollections().toArray();

    const userCols = cols.filter(c => c.name.startsWith("userdatas-"));

    let user = null;

    for (const col of userCols) {

      user = await db.collection(col.name).findOne({ email });

      if (user) break;

    }

    if (!user) {
      return res.send("User not found");
    }

    if (user.password !== password) {
      return res.send("Wrong password");
    }

    const firstName = user.name.split(" ")[0];

    res.send(firstName);

  } catch (error) {

    console.log(error);
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
