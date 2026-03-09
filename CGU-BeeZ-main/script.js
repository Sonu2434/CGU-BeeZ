// Sample data (replace with API or backend fetch)
const papers = [
  { title: "Maths - Semester 1", semester: "1", subject: "Maths", link: "#" },
  { title: "Physics - Semester 2", semester: "2", subject: "Physics", link: "#" },
  { title: "DSA - Semester 3", semester: "3", subject: "DSA", link: "#" },
  { title: "DBMS - Semester 4", semester: "4", subject: "DBMS", link: "#" },
];

const paperList = document.getElementById("paperList");
const semesterFilter = document.getElementById("semesterFilter");
const searchInput = document.getElementById("searchInput");

function displayPapers(filteredPapers) {
  paperList.innerHTML = "";
  filteredPapers.forEach(paper => {
    const div = document.createElement("div");
    div.className = "paper-card";
    div.innerHTML = `
      <h3>${paper.title}</h3>
      <p>Semester: ${paper.semester}</p>
      <p>Subject: ${paper.subject}</p>
      <a href="${paper.link}" target="_blank">Download</a>
    `;
    paperList.appendChild(div);
  });
}

// Initial render
displayPapers(papers);

// Filter by semester
semesterFilter.addEventListener("change", () => {
  const value = semesterFilter.value;
  const filtered = value ? papers.filter(p => p.semester === value) : papers;
  displayPapers(filtered);
});

// Search by subject/title
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = papers.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.subject.toLowerCase().includes(query)
  );
  displayPapers(filtered);
});

// Mobile Navbar Toggle
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Smooth Scroll for Explore Button
document.querySelector(".explore-btn").addEventListener("click", () => {
  
  document.querySelector("#explore").scrollIntoView({ behavior: "smooth" });
});

//--------------Explore -> check user present or not------------------
function Checking_user(){
  
  let cku= localStorage.getItem('Checkuser');
 if(cku){
  
  window.location.href="questionbankpage.html"
  
 }
 else if(cku==null){
window.location.href="login.html"
 }
}


