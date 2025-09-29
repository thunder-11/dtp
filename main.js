const firebaseConfig = {
  apiKey: "AIzaSyDrawO7KtgK6xe9zioTJ851ii_OmQwgL5E",
  authDomain: "eventms-3f505.firebaseapp.com",
  projectId: "eventms-3f505",
  storageBucket: "eventms-3f505.firebasestorage.app",
  messagingSenderId: "462891335836",
  appId: "1:462891335836:web:9d2638e06783b330a2ed59",
  measurementId: "G-V6MP0Q86JT"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = firebase.auth()
const db = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("section");
  const checkIcon = document.querySelector(".fa-circle-check");
  const img = document.getElementById("img");
  const message = document.getElementById("message");
  const username = document.getElementById("username")
  const email = document.getElementById("email");
  const password = document.getElementById("password");


  window.addData = function (event) {
    event.preventDefault();
    const emailv = email.value.replace(/\./g, "_");
    db.ref("users/" + emailv).set({
      username: username.value,
      email: email.value,
      password: password.value
    }).then(() => {
      alert("User registered successfully!");
    }).catch((error) => {
      console.error("Error adding user:", error);
    });
  }

  /* window.getData = function(event) {
    event.preventDefault();

    const emailv = email.value.replace(/\./g, "_");

    db.ref("users/" + emailv).get().then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === password.value) {
          message.innerHTML = 'Logged in successfully';
          section.classList.add("active");
        } else {
          alert("Invalid credentials.");
        }
      } else {
        alert("User does not exist.");
      }
    }).catch((error) => {
      console.error("Login error:", error);
    });
  } */

  window.login = function(event){
    if (event && typeof event.preventDefault === "function") {event.preventDefault();}
    auth.signInWithEmailAndPassword(email.value, password.value)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("User signed in:", user.email);
    message.innerHTML = 'Logged in successfully';
    section.classList.add("active");
  })
  .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error("Sign-in error:", errorCode, errorMessage);

            switch (errorCode) {
        case 'auth/invalid-login-credentials':
            alert("Error: Invalid email or password. Please check your credentials and try again.");
            break;
        case 'auth/too-many-requests':
            alert("Access to this account has been temporarily disabled due to too many failed login attempts. Please try again later.");
            break;
        case 'auth/invalid-email':
             alert("Error: The email address is not valid. Please check the format.");
             break;
        default:
            alert(`An unexpected error occurred: ${error.message}`);
            break;
    }
          });
  }

  const eventContainer = document.getElementById("events-container");
  function safe(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }


function loading(){
  eventContainer.innerHTML = "";
  
  db.ref("events/").get().then((snapshot) => {
        if (!snapshot.exists()) {
          eventContainer.innerHTML = "<p>No events available.</p>";
          return;
        }

    snapshot.forEach(childSnap => {
      const ev = childSnap.val();
      const card = document.createElement("div");
      card.className = "box";

      const title = safe(ev.title);
      const desc = safe(ev.description || "");
      const date = safe(ev.date || "");

      card.innerHTML = `
        <div class="box-content">
          <p class="event-title">${title}</p>
          <p class="event-description">${desc}</p>
          <p class="event-date"><b>Date:</b> ${date}</p>
        </div>
      `;

      eventContainer.appendChild(card);
    })
  })
 }

const togglePasswordIcon = document.getElementById("togglePassword");

window.togglePass = function () {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    
    togglePasswordIcon.classList.toggle("fa-eye");
    togglePasswordIcon.classList.toggle("fa-eye-slash");

};

  window.fun = function(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
  
    db.ref("events").push({
      title: "Sample Workshop",
      description: "Hands-on web dev workshop",
      date: "2025-10-20"
    })
    .then(() => {
      alert("Event added");
      loading();
    })
    .catch((error) => {
      console.error("Error adding event:", error);
      alert("Error adding event: " + error.message);
    });
}
  if (eventContainer) {
    loading();
  }
});
