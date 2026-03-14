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

if (paperList) {
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

  displayPapers(papers);

  semesterFilter.addEventListener("change", () => {
    const value = semesterFilter.value;
    const filtered = value ? papers.filter(p => p.semester === value) : papers;
    displayPapers(filtered);
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = papers.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.subject.toLowerCase().includes(query)
    );
    displayPapers(filtered);
  });
}

// ── Hamburger Menu ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks   = document.querySelector(".nav-links");

  if (!menuToggle || !navLinks) return;

  // Toggle open / close
  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
    menuToggle.innerHTML = navLinks.classList.contains("active") ? "&#10005;" : "&#9776;";
  });

  // Close when any nav link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.innerHTML = "&#9776;";
    });
  });

  // Close when clicking outside the menu
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove("active");
      menuToggle.innerHTML = "&#9776;";
    }
  });

});

// ── Check user before Explore ─────────────────────────────────────
function Checking_user() {
  const cku = localStorage.getItem('Checkuser');
  if (cku) {
    window.location.href = "questionbankpage.html";
  } else {
    window.location.href = "login.html";
  }
}