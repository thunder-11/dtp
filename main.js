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

let emailv = null;
let userData = null;

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("section");
  const checkIcon = document.querySelector(".fa-circle-check");
  const img = document.getElementById("img");
  const message = document.getElementById("message");
  const username = document.getElementById("username")
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  let currentUserID = null;
  let currentEmail = null;
  const eventContainer = document.getElementById("events-container");
  const modalContainer = document.getElementById('modal-container');
  const registrationEmail = document.getElementById("registration-email");
  const modalRegistrationButton = document.getElementById("modal-registration-btn");
  const eventForm = document.getElementById('event-form');
  const togglePasswordIcon = document.getElementById("togglePassword");
  const profileSection = document.querySelector(".profile-section");
  const eventDetailsContainer = document.getElementById('event-details-container');
  const urlParams = new URLSearchParams(window.location.search);
  const eventID = urlParams.get('id');
  const openModalBtn = document.getElementById('open-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const dateTimeInput = document.getElementById('date');
  const clubNames = document.getElementById("club");

  auth.onAuthStateChanged((user) => {
    if (user) {
      emailv = user.email.replace(/\./g, "_");
      currentEmail = user.email;
      currentUserID = user.uid;

      if (registrationEmail) {
        registrationEmail.value = currentEmail;
      }

      db.ref("users/" + emailv).get().then((snap) => {
        if (snap.exists()) {
          const userData = snap.val();
          if (userData.username) {

            profileSection.innerHTML = `
            <span id="profilename" class="profile-name font-comic">${userData.username}</span>
            <a href="profile.html" class="profile-icon-link">
              <i data-lucide="user" style="width: 1.5rem; height: 1.5rem; color: #475569;"></i>
            </a>
            <button class="custom-button" onclick="logOut()" style="background-color: #f44336;">Logout</button>
          `;

            if (typeof lucide !== 'undefined') {
              lucide.createIcons();
            }
          }

          if (fileName() == 'admin.html') {
            db.ref(`users/${emailv}/access/`).get().then((snapshot) => {
              if (!snapshot.exists()) {
                return;
              }

              snapshot.forEach((childSnap) => {
                console.log(childSnap);
                const clubName = childSnap.key;
                const hasAccess = childSnap.val();
                if (hasAccess === true) {
                  const club = document.createElement('option');
                  club.value = clubName;
                  club.innerHTML = clubName;
                  clubNames.appendChild(club);
                }

              })
            }).catch((error) => {
              console.error("Error:", error);
            });
          }
        } else {
          alert("User not found");
        }
      });


    } else {

      profileSection.innerHTML = `
        <a href="login.html" class="custom-button" style="background-color: #4f46e5;">
          Login
        </a>
    `;
      if (registrationEmail) {
        registrationEmail.value = "Please login first";
      }

      currentEmail = null;
      currentUserID = null;
    }
  });

  function fileName() {
    let path = window.location.pathname;
    let file = path.substring(path.lastIndexOf('/') + 1);
    return file;
  }


  function isDirectory() {
    let path = window.location.pathname;
    let file = path.substring(path.lastIndexOf('/') + 1);

    if (path.endsWith('/') || file === '') {
      return true;
    }

    if (file.indexOf('.') === -1) {
      return true;
    }

    return false;
  }

  if (fileName() == 'admin.html') {
    function OpenModal() {
      modalContainer.classList.add('is-visible');
    };

    function CloseModal() {
      modalContainer.classList.remove('is-visible');
    };

    const setMinDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      dateTimeInput.setAttribute('min', localDateTime);
    };

    setMinDateTime();

    openModalBtn.addEventListener('click', OpenModal);
    closeModalBtn.addEventListener('click', CloseModal);
    cancelBtn.addEventListener('click', CloseModal);


    eventForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(eventForm);
      db.ref("events").push({
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        time: formData.get('time'),
        club: formData.get('club'),
        type: formData.get('eventType'),
        participantsCount: 0
      })
        .then(() => {
          alert(`Event "${formData.get('title')}" created successfully!`);
          loading();
        })
        .catch((error) => {
          console.error("Error adding event:", error);
          alert("Error adding event: " + error.message);
        });

      eventForm.reset();
      closeModal();
    });
  }

  if (eventID) {
    db.ref(`events/${eventID}`).get().then((snapshot) => {
      if (snapshot.exists()) {
        const eventval = snapshot.val();
        const typeEl = document.getElementById('event-detail-type');
        const nameEl = document.getElementById('event-detail-name');
        const hostEl = document.getElementById('event-detail-host');
        const descEl = document.getElementById('event-detail-desc');
        const detailsBox = document.getElementById('box');

        typeEl.textContent = eventval.type;
        nameEl.textContent = eventval.title;
        hostEl.innerHTML = `Hosted by <a href="#" class="nav-link" style="font-weight: 600;">${eventval.club}</a>`;
        descEl.innerHTML = eventval.description;


        detailsBox.innerHTML = `
        <div id="event-detail-info-box" style="background-color: #f1f5f9; border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column;">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #e2e8f0;">
                                    <div style="display: flex; align-items: center; flex-shrink: 0;"><i data-lucide="calendar" style="width: 1.25rem; height: 1.25rem; color: #4f46e5; margin-right: 0.75rem;"></i><p style="font-weight: 500; color: #475569;">Date</p></div>
                                    <p style="font-weight: 600; color: #1e293b; text-align: right;">${eventval.date}</p>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #e2e8f0;">
                                    <div style="display: flex; align-items: center; flex-shrink: 0;"><i data-lucide="clock" style="width: 1.25rem; height: 1.25rem; color: #4f46e5; margin-right: 0.75rem;"></i><p style="font-weight: 500; color: #475569;">Time</p></div>
                                    <p style="font-weight: 600; color: #1e293b; text-align: right;">${eventval.time || 'TBA'}</p>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #e2e8f0;">
                                    <div style="display: flex; align-items: center; flex-shrink: 0;"><i data-lucide="users" style="width: 1.25rem; height: 1.25rem; color: #4f46e5; margin-right: 0.75rem;"></i><p style="font-weight: 500; color: #475569;">Participants</p></div>
                                    <p style="font-weight: 600; color: #1e293b; text-align: right;">${eventval.participantsCount ? eventval.participantsCount : 'TBA'}</p>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0;">
                                    <div style="display: flex; align-items: center; flex-shrink: 0;"><i data-lucide="ticket" style="width: 1.25rem; height: 1.25rem; color: #4f46e5; margin-right: 0.75rem;"></i><p style="font-weight: 500; color: #475569;">Fees</p></div>
                                    <p style="font-weight: 600; color: #1e293b; text-align: right;">${eventval.fees || 'Free'}</p>
                                </div>
                                </div>
                                <button id="event-detail-register-btn" style="width: 100%; background-color: #4f46e5; color: white; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem; transition: background-color 0.3s; cursor: pointer; border: none;" id="registration-btn" data-id="${snapshot.key}" onclick="openModal(event)">Register Now</button>
                            `;
        lucide.createIcons();
      } else {
        // FIX: Changed eventDetailsContainer to descEl
        const descEl = document.getElementById('event-detail-desc');
        if (descEl) descEl.innerHTML = `<p>Error: Event not found.</p>`;
      }
    }).catch((error) => {
      console.error("Firebase fetch error:", error);
      // FIX: Changed eventDetailsContainer to descEl
      const descEl = document.getElementById('event-detail-desc');
      if (descEl) descEl.innerHTML = `<p>Error loading event details.</p>`;
    });
  }

  function safe(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function loading() {
    let dbref = null;
    eventContainer.innerHTML = "";
    if (fileName() == "index.html" || isDirectory()) {
      dbref = db.ref("events/").orderByChild('date').limitToFirst(3);
    } else {
      dbref = db.ref("events/").orderByChild('date');
    }

    dbref.get().then((snapshot) => {
      if (!snapshot.exists()) {
        eventContainer.innerHTML = "<p>No events available.</p>";
        return;
      }

      snapshot.forEach(childSnap => {
        const ev = childSnap.val();
        const card = document.createElement("div");
        card.className = "box";
        let notification = '';


        const title = safe(ev.title);
        const desc = safe(ev.description || "");
        const date = safe(ev.date || "");

        const typeColors = {
          'Seminar': 'background-color: #ecf9ff; color: #0284c7;',
          'Workshop': 'background-color: #fefce8; color: #b45309;',
          'Event': 'background-color: #eef2ff; color: #4338ca;'
        };


        card.innerHTML = `
                    <div class="event-card card-hover-effect">
                        <div class="event-card-content">
                            <div class="event-card-header">
                              <span class="event-type-badge" style="${typeColors[ev.type]}">${ev.type}</span>
                                <span class="event-date">${ev.date}</span>
                                <span class="event-date">${ev.time}</span>
                            </div>
                            <h3 class="event-title">${ev.title}</h3>
                            <p class="event-description">${ev.description}</p>
                            <div class="event-organizer">
                                <div class="clubname">
                                <i data-lucide="shield" style="width: 1rem; height: 1rem; margin-right: 0.5rem;"></i>
                                <span>Organized by <strong>${ev.club}</strong></span>
                                </div>

                            <button class="view-more" id="view-more-btn" data-id="${childSnap.key}" onclick="openDetails(event)">View more</button>
                            </div>
                        </div>
                        ${notification}
                    </div>`;


        eventContainer.appendChild(card);

        lucide.createIcons();
      })
    })
  }

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

  window.checkAdmin = function () {
    if (userData.admin && userData.admin == true) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }

  window.login = function (event) {
    if (event && typeof event.preventDefault === "function") { event.preventDefault(); }
    auth.signInWithEmailAndPassword(email.value, password.value)
      .then((userCredential) => {
        const emailv = email.value.replace(/\./g, "_");
        db.ref("users/" + emailv).get().then((snap) => {
          userData = snap.val();
        })
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


  window.openDetails = function (event) {
    const target = event.target;
    const eventID = target.getAttribute('data-id');

    if (eventID) {
      window.location.href = `eventdetails.html?id=${eventID}`;
    } else {
      alert("Could not find event!");
    }
  };

  window.openModal = function (event) {
    const target = event.target;
    modalContainer.classList.add('is-visible');
    modalRegistrationButton.setAttribute('data-id', target.getAttribute('data-id'));
  };

  window.closeModal = function (event) {
    modalContainer.classList.remove('is-visible');
  };

  window.exitModal = function () {
    section.classList.remove("active");
  };


  window.registration = function (event) {
    event.preventDefault();
    const eventID = modalRegistrationButton.getAttribute('data-id');
    const formData = new FormData(eventForm);
    const name = formData.get('name');
    const email = formData.get('email');

    if (!email || email == "Please login first") {
      alert("Please login first");
      return;
    }
    if (!name) {
      alert("Enter name");
      return;
    }


    db.ref(`registrations/${eventID}/${currentUserID}/`).get().then((snapshot) => {
      if (!snapshot.exists()) {
        db.ref(`registrations/${eventID}/${currentUserID}/`).set({
          name: formData.get('name'),
          email: formData.get('email')
        }).then(() => {
          db.ref(`events/${eventID}/participantsCount/`).transaction((currentValue) => {
            return (currentValue || 0) + 1;
          });

          section.classList.add("active");
          closeModal();
        }).catch((error) => {
          alert("Error:" + error.message)
        })
      } else {
        alert("Email already registered")
      }
    }).catch((error) => {
      alert("Error:" + error.message)
    })
  }

  window.togglePass = function () {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    togglePasswordIcon.classList.toggle("fa-eye");
    togglePasswordIcon.classList.toggle("fa-eye-slash");

  };

  window.fun = function (e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    db.ref("events").push({
      title: "Sample Workshop",
      description: "Hands-on web dev workshop",
      date: "2025-10-20",
      club: "CSI",
      time: "10:00",
      type: "Seminar",
      participantsCount: 0
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

  window.logOut = function () {
    auth.signOut().then(() => {
      console.log("User signed out successfully.");
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  }

});
