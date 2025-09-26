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

const db = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("section");
  const checkIcon = document.querySelector(".fa-circle-check");
  const img = document.getElementById("img");
  const message = document.getElementById("message");
  const username = document.getElementById("username")
  const email = document.getElementById("email");
  const password = document.getElementById("password");


  function addData(event) {
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

  function getData(event) {
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
  }
  
  const form = document.querySelector("form");
  form.addEventListener("submit", getData);
});
