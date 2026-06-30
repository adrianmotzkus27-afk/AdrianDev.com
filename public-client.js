const socket = io();
let currentRoom = null;
let chatSender = "admin";
let chatRole = "admin";

const chatMessagesEl = document.getElementById("message-list");
const chatTitleEl = document.getElementById("chat-title");
const chatSubtitleEl = document.getElementById("chat-subtitle");
const chatFormEl = document.getElementById("chat-form");
const chatInputEl = document.getElementById("chat-input");

function joinChatRoom(room, sender = "admin", role = "admin") {
  if (!room) return;
  currentRoom = room;
  chatSender = sender;
  chatRole = role;
  socket.emit("joinRoom", room);
  if (chatTitleEl) chatTitleEl.textContent = `Live Chat: ${room}`;
  if (chatSubtitleEl) chatSubtitleEl.textContent = role === "admin" ? "Chatte live mit Kunden." : "Chatte live mit Adrian.";
  if (chatMessagesEl) chatMessagesEl.innerHTML = "";
}

function addChatMessage(message, type = "incoming") {
  if (!chatMessagesEl) return;
  const item = document.createElement("div");
  item.className = `message-item ${type}`;
  item.innerHTML = `
    <div class="message-text">${message.text}</div>
    <div class="message-meta">${message.sender} • ${new Date(message.timestamp).toLocaleTimeString("de-DE")}</div>
  `;
  chatMessagesEl.appendChild(item);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function sendChatMessage(text) {
  if (!currentRoom || !text) return;
  const payload = {
    room: currentRoom,
    text,
    sender: chatSender,
    role: chatRole,
  };
  socket.emit("sendMessage", payload);
  addChatMessage({ text, timestamp: new Date().toISOString(), sender: chatSender }, "outgoing");
}

socket.on("systemMessage", (text) => {
  if (!chatMessagesEl) return;
  const item = document.createElement("div");
  item.className = "message-item incoming";
  item.innerHTML = `<div class="message-text"><em>${text}</em></div>`;
  chatMessagesEl.appendChild(item);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
});

socket.on("chatMessage", (payload) => {
  const type = payload.sender === chatSender ? "outgoing" : "incoming";
  addChatMessage(payload, type);
});

if (chatFormEl && !window.disableDefaultChatForm) {
  chatFormEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInputEl?.value.trim();
    if (!text || !currentRoom) return;
    sendChatMessage(text);
    if (chatInputEl) chatInputEl.value = "";
  });
}

window.joinChatRoom = joinChatRoom;
window.sendChatMessage = sendChatMessage;
