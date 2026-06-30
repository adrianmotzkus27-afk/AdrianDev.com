const adminEmail = "adrian.motzkus27@gmail.com";
const usersKey = "adrianDev_users";
const sessionKey = "adrianDev_session";
const hireRequestsKey = "adrianDev_hireRequests";
const defaultHireItems = [
  { id: 1, title: "Kunde aus Website", subtitle: "Neues Webprojekt", text: "Klick auf Hire, um die Anfrage zu senden." },
  { id: 2, title: "Social Media Video", subtitle: "Marketingvideo", text: "E-Mail mit Akzeptieren/Ablehnen vorbereiten." },
  { id: 3, title: "Design Auftrag", subtitle: "Branding / Motion", text: "Name, Telefon und Info angeben." }
];
let loadedVideos = [];
let activeHireId = null;
let hireRequests = [];
const contactsKey = "adrianDev_contacts";
const messagesKey = "adrianDev_messages";
const videoViewsKey = "adrianDev_videoViews";
let contacts = [];
let messages = [];
let activeContactId = null;
let videoViews = 0;
const statProjects = document.getElementById("stat-projects");
const statHireRequests = document.getElementById("stat-hire-requests");
const statVideoViews = document.getElementById("stat-video-views");

const authScreen = document.getElementById("auth-screen");
const mainScreen = document.getElementById("main-screen");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const userEmailText = document.getElementById("user-email");
const logoutButton = document.getElementById("logout-button");
const navButtons = document.querySelectorAll(".nav-button");
const screens = document.querySelectorAll(".screen");
const hireList = document.getElementById("hire-list");
const createdHireList = document.getElementById("created-hire-list");
const newHireButton = document.getElementById("new-hire-button");
const hireModal = document.getElementById("hire-modal");
const closeHireModal = document.getElementById("close-hire-modal");
const hireForm = document.getElementById("hire-form");
const hireStatus = document.getElementById("hire-status");
const dropArea = document.getElementById("drop-area");
const videoInput = document.getElementById("video-input");
const pickVideosButton = document.getElementById("pick-videos");
const videoList = document.getElementById("video-list");
const contactList = document.getElementById("contact-list");
const contactForm = document.getElementById("contact-form");
const newContactName = document.getElementById("new-contact-name");
const chatTitle = document.getElementById("chat-title");
const chatSubtitle = document.getElementById("chat-subtitle");
const messageList = document.getElementById("message-list");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

function init() {
  loginTab.addEventListener("click", () => switchAuthTab("login"));
  registerTab.addEventListener("click", () => switchAuthTab("register"));
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);
  logoutButton.addEventListener("click", logout);
  navButtons.forEach((button) => button.addEventListener("click", handleNav));
  closeHireModal.addEventListener("click", () => toggleHireModal(false));
  newHireButton.addEventListener("click", () => openHireForm(null));
  hireForm.addEventListener("submit", handleHireSubmit);
  contactForm.addEventListener("submit", handleContactSubmit);
  chatForm.addEventListener("submit", handleChatSubmit);
  pickVideosButton.addEventListener("click", () => videoInput.click());
  videoInput.addEventListener("change", handleVideoFiles);

  ["dragenter", "dragover"].forEach((event) => dropArea.addEventListener(event, handleDragOver));
  ["dragleave", "drop"].forEach((event) => dropArea.addEventListener(event, handleDragLeave));
  dropArea.addEventListener("drop", handleDrop);

  const session = loadSession();
  if (session) {
    showApp(session.email);
  }
  hireRequests = loadHireRequests();
  contacts = loadContacts();
  messages = loadMessages();
  videoViews = loadVideoViews();
  renderContactList();
  renderHireList();
  renderStats();
}

function switchAuthTab(tab) {
  if (tab === "login") {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    loginTab.classList.remove("active");
    registerTab.classList.add("active");
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
  }
  authMessage.textContent = "";
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value.trim();
  const users = loadUsers();

  if (!users[email] || users[email].password !== password) {
    authMessage.textContent = "Invalid email or password.";
    return;
  }
  saveSession({ email });
  showApp(email);
}

function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const password = document.getElementById("register-password").value.trim();
  const confirm = document.getElementById("register-password-confirm").value.trim();
  const users = loadUsers();

  if (password.length < 5) {
    authMessage.textContent = "Password must be at least 5 characters long.";
    return;
  }
  if (password !== confirm) {
    authMessage.textContent = "Passwörter stimmen nicht überein.";
    return;
  }
  if (users[email]) {
    authMessage.textContent = "Dieser Account existiert bereits.";
    return;
  }

  users[email] = { email, password };
  saveUsers(users);
  saveSession({ email });
  showApp(email);
}

function handleNav(event) {
  const target = event.currentTarget.dataset.screen;
  selectScreen(target);
}

function selectScreen(screenId) {
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.screen === screenId));
  screens.forEach((screen) => screen.classList.toggle("active-screen", screen.id === `${screenId}-screen`));
}

function showApp(email) {
  authScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
  userEmailText.textContent = email;
  window.chatSender = email;
  selectScreen("home");
}

function logout() {
  localStorage.removeItem(sessionKey);
  authScreen.classList.remove("hidden");
  mainScreen.classList.add("hidden");
  authMessage.textContent = "Du wurdest abgemeldet.";
}

function loadUsers() {
  const raw = localStorage.getItem(usersKey);
  return raw ? JSON.parse(raw) : {};
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function loadSession() {
  const raw = localStorage.getItem(sessionKey);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(session) {
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

function loadHireRequests() {
  const raw = localStorage.getItem(hireRequestsKey);
  return raw ? JSON.parse(raw) : [];
}

function saveHireRequests() {
  localStorage.setItem(hireRequestsKey, JSON.stringify(hireRequests));
}

function loadContacts() {
  const raw = localStorage.getItem(contactsKey);
  return raw ? JSON.parse(raw) : [];
}

function saveContacts() {
  localStorage.setItem(contactsKey, JSON.stringify(contacts));
}

function loadMessages() {
  const raw = localStorage.getItem(messagesKey);
  return raw ? JSON.parse(raw) : [];
}

function saveMessages() {
  localStorage.setItem(messagesKey, JSON.stringify(messages));
}

function loadVideoViews() {
  const raw = localStorage.getItem(videoViewsKey);
  return raw ? Number(raw) : 0;
}

function saveVideoViews() {
  localStorage.setItem(videoViewsKey, String(videoViews));
}

function renderStats() {
  if (statProjects) statProjects.textContent = String(loadedVideos.length);
  if (statHireRequests) statHireRequests.textContent = String(hireRequests.length);
  if (statVideoViews) statVideoViews.textContent = String(videoViews);
}

function renderContactList() {
  contactList.innerHTML = "";
  if (contacts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No contacts yet. Add a new contact.";
    contactList.appendChild(empty);
    activeContactId = null;
    updateChatHeader();
    renderMessages();
    return;
  }

  contacts.forEach((contact) => {
    const card = document.createElement("div");
    card.className = `contact-card ${activeContactId === contact.id ? "active" : ""}`;
    card.innerHTML = `<strong>${contact.name}</strong>`;
    card.addEventListener("click", () => openContact(contact.id, true));
    contactList.appendChild(card);
  });

  if (!activeContactId && contacts.length > 0) {
    activeContactId = contacts[0].id;
  }
  updateChatHeader();
}

function openContact(contactId, openChat = false) {
  activeContactId = contactId;
  const contact = contacts.find((item) => item.id === contactId);
  if (openChat) {
    selectScreen("chat");
  }
  renderContactList();
  updateChatHeader();
  if (contact) {
    window.currentRoom = contact.roomId;
    if (window.joinChatRoom) {
      window.joinChatRoom(contact.roomId, window.chatSender || contact.name, "admin");
    }
  }
}

function updateChatHeader() {
  const contact = contacts.find((item) => item.id === activeContactId);
  if (contact) {
    chatTitle.textContent = contact.name;
    chatSubtitle.textContent = `Private chat with ${contact.name}`;
    chatInput.disabled = false;
  } else {
    chatTitle.textContent = "Kein Kontakt ausgewählt";
    chatSubtitle.textContent = "Select a contact from the list or add a new one.";
    chatInput.disabled = true;
  }
}

function renderMessages() {
  // Live chat uses Socket.IO rendering from public-client.js.
}

function handleContactSubmit(event) {
  event.preventDefault();
  const name = newContactName.value.trim();
  if (!name) {
    return;
  }
  const contact = findOrCreateContact(name);
  newContactName.value = "";
  openContact(contact.id, true);
}

function findOrCreateContact(name) {
  const roomId = `room-${name.trim().toLowerCase().replace(/\W+/g, "-")}`;
  const existing = contacts.find((contact) => contact.roomId === roomId);
  if (existing) {
    return existing;
  }
  const newContact = { id: Date.now(), name, roomId };
  contacts.unshift(newContact);
  saveContacts();
  return newContact;
}


function handleChatSubmit(event) {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !activeContactId || !window.currentRoom) {
    return;
  }
  chatInput.value = "";
  if (window.sendChatMessage) {
    window.sendChatMessage(text);
    return;
  }
  // Fallback local chat behavior if Socket.IO is unavailable.
  const message = {
    id: Date.now(),
    contactId: activeContactId,
    sender: "user",
    text,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  saveMessages();
  renderMessages();
}

function renderHireList() {
  createdHireList.innerHTML = "";
  if (hireRequests.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No created hire requests yet.";
    createdHireList.appendChild(empty);
  } else {
    hireRequests.forEach((request) => {
      const card = document.createElement("div");
      card.className = "hire-card";
      card.innerHTML = `
        <div>
          <h3>${request.title}</h3>
          <p><strong>Name:</strong> ${request.name}</p>
          <p><strong>Telefon:</strong> ${request.phone}</p>
          <p><strong>Info:</strong> ${request.info}</p>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 8px;">Erstellt am ${new Date(request.createdAt).toLocaleString("de-DE")}</p>
        </div>
        <button type="button" class="secondary-button" data-contact="${request.contactId}">Chat</button>
      `;
      card.querySelector("button").addEventListener("click", () => openContact(request.contactId, true));
      createdHireList.appendChild(card);
    });
  }

  hireList.innerHTML = "";
  defaultHireItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "hire-card";
    card.innerHTML = `
      <div>
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 8px;">${item.text}</p>
      </div>
      <button type="button" class="primary-button" data-id="${item.id}">Hire</button>
    `;
    card.querySelector("button").addEventListener("click", () => openHireForm(item.id));
    hireList.appendChild(card);
  });
}

function openHireForm(id) {
  activeHireId = id;
  hireStatus.textContent = "";
  hireForm.reset();
  hireModal.classList.remove("hidden");
}

function toggleHireModal(open) {
  hireModal.classList.toggle("hidden", !open);
}

function handleHireSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("client-name").value.trim();
  const phone = document.getElementById("client-phone").value.trim();
  const info = document.getElementById("client-message").value.trim();

  if (!name) {
    hireStatus.textContent = "Please enter a name.";
    return;
  }
  if (!info) {
    hireStatus.textContent = "Please enter details or a message.";
    return;
  }

  const phoneLabel = phone || "Nicht gegeben";
  const item = defaultHireItems.find((entry) => entry.id === activeHireId) || { title: "Hire-Anfrage" };

  const request = {
    id: Date.now(),
    title: item.title,
    name,
    phone: phoneLabel,
    info,
    createdAt: new Date().toISOString(),
  };

  const contact = findOrCreateContact(name);
  request.contactId = contact.id;
  hireRequests.unshift(request);
  saveHireRequests();
  renderHireList();
  openContact(contact.id, true);
  renderStats();

  const subject = encodeURIComponent(`New hire request: ${item.title}`);
  const body = encodeURIComponent(`New hire request\n\nName: ${name}\nPhone: ${phoneLabel}\nDetails: ${info}\nProject: ${item.title}\n\nPlease accept or reject:\n- Accept\n- Reject\n`);
  const mailtoURL = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

  hireStatus.textContent = "Email prepared. Your email client will open shortly.";
  window.open(mailtoURL, "_blank");
  setTimeout(() => toggleHireModal(false), 600);
}

function handleVideoFiles(event) {
  const files = event.target.files || event.dataTransfer.files;
  const videos = Array.from(files).filter((file) => file.type.startsWith("video/"));
  if (!videos.length) {
    return;
  }
  videos.forEach((file) => {
    const url = URL.createObjectURL(file);
    loadedVideos.push({ name: file.name, url });
  });
  renderVideoList();
  renderStats();
}

function handleDragOver(event) {
  event.preventDefault();
  dropArea.classList.add("drop-active");
}

function handleDragLeave(event) {
  event.preventDefault();
  dropArea.classList.remove("drop-active");
}

function handleDrop(event) {
  event.preventDefault();
  dropArea.classList.remove("drop-active");
  handleVideoFiles(event);
}

function renderVideoList() {
  videoList.innerHTML = "";
  if (!loadedVideos.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No videos yet. Drag your work here.";
    videoList.appendChild(empty);
    return;
  }

  loadedVideos.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <h3>${video.name}</h3>
      <video controls src="${video.url}"></video>
      <div class="video-actions">
        <button type="button" class="secondary-button" data-index="${index}">Entfernen</button>
      </div>
    `;
    const videoElement = card.querySelector("video");
    videoElement.addEventListener("play", () => {
      videoViews += 1;
      saveVideoViews();
      renderStats();
    });
    card.querySelector("button").addEventListener("click", () => removeVideo(index));
    videoList.appendChild(card);
  });
}

function removeVideo(index) {
  const removed = loadedVideos.splice(index, 1);
  if (removed[0]) {
    URL.revokeObjectURL(removed[0].url);
  }
  renderVideoList();
  renderStats();
}

init();
