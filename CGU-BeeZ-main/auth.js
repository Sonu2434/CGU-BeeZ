function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

// Basic Signup Validation
document.getElementById("signupForm")?.addEventListener("submit", function(e){
  e.preventDefault();

  const pass = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if(pass !== confirm){
    alert("Passwords do not match!");
    return;
  }
crt_acc()
  
  
});

// Basic Login Demo
document.getElementById("loginForm")?.addEventListener("submit", function(e){
  e.preventDefault();
  login()
  
  //window.location.href = "index.html";
});

//--------------------------------------SENDING DATA TO DATABASE-------------------------------------------------





async function crt_acc() {
  const password = document.getElementById("signupPassword").value.trim();
  const confirmpassword = document.getElementById("confirmPassword").value.trim();
  const e_mail = document.getElementById("email").value.trim()
  const _name = document.getElementById("name").value.trim()

  console.log("line-67")

  const dataset = {
    name: _name,
    email: e_mail,
    password: password,
    confpassword: confirmpassword
  };

  try {
    const response = await fetch("https://cgu-beez.onrender.com/Signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(dataset)
    });

    const result = await response.text();
    if(result=="Received-Data"){
window.location.href="login.html"
    }
    else{
    document.getElementById("msg").innerHTML=result}

  } catch (error) {
    console.error("Error:", error);
  }

  console.log("line-92")
}

//----------LOGIN data from login.html-----------
async function login(){
  
  let los = document.getElementById("login-status")
  let L_email = document.getElementById("email").value.trim()
  let L_pass = document.getElementById("loginPassword").value.trim()
  
  let dataset = {
    email: L_email,
    password: L_pass
  }

  let response = await fetch("https://cgu-beez.onrender.com/Login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(dataset)
  })

  let result = await response.text()

if(result!=="User not found"&&result!=="Wrong password"&&result!=="Login Error"){
window.location.href = "index.html";
localStorage.setItem('Checkuser',result)
return
}
if(result=="Wrong password"||'User not found'||"Login Error"){
     los.innerHTML=result
     return
}
  
}
