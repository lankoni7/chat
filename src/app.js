import "./index.html";
import "./main.scss";
import tempMessage from "./templates/message.hbs";
import tempUser from "./templates/user.hbs";

const users = new Map();
const chatBody = main.querySelector(".chat__body");
const userName = document.getElementById("user-name");

function startWS(name) {
  const chatForm = document.querySelector(".chat__form");
  const chatInput = chatForm.message;
  const ws = new WebSocket("ws://127.0.0.1:9000");

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "hello", user: name }));
  };
  ws.onmessage = (e) => {
    getMsgFromServ(e.data);
  };

  chatForm.onsubmit = (ev) => {
    ev.preventDefault();
    const message = chatInput.value.trim();

    if (message) {
      ws.send(JSON.stringify({ type: "text", text: chatInput.value }));
    }
    chatInput.value = "";
  };

  const hamburger = document.getElementById("hamburger");
  const modalAvatar = document.getElementById("modal-avatar");
  const loadAvatar = document.getElementById("load-avatar");
  const closeModal = document.getElementById("close");
  const fileReader = new FileReader();

  hamburger.addEventListener("click", () => {
    modalAvatar.classList.toggle("hidden");
  });

  loadAvatar.addEventListener("change", (e) => {
    const [file] = e.target.files;
    fileReader.readAsDataURL(file);
    modalAvatar.classList.add("hidden");
  });
  closeModal.addEventListener("click", () => {
    modalAvatar.classList.add("hidden");
  });

  fileReader.addEventListener("load", (e) => {
    const src = fileReader.result;
    ws.send(JSON.stringify({ type: "img", user: name, src }));
  });
}

function doLogin() {
  const modal = document.getElementById("modal");
  const main = document.getElementById("main");
  const loginForm = modal.querySelector(".modal__form");
  const error = modal.querySelector(".modal__error");
  const loginInput = loginForm.nick;

  loginForm.onsubmit = (ev) => {
    ev.preventDefault();
    error.textContent = "";

    const name = loginInput.value.trim();

    if (!name) {
      error.textContent = "Введите ник!";
    } else {
      modal.classList.toggle("hidden");
      main.classList.toggle("hidden");
      startWS(name);
      userName.textContent = name;
    }
  };
}

function getMsgFromServ(stringMessage) {
  const message = JSON.parse(stringMessage);

  if (message.type === "hello") {
    printUsers();
    addSystMessage(`Пользователь ${message.user} вошел в чат`);
  } else if (message.type === "user-list") {
    [...message.data].forEach(({ user, src }) => {
      users.set(user, { user, src });
      printUsers();
    });
  } else if (message.type === "bye") {
    users.delete(message.user);
    printUsers();
    addSystMessage(`Пользователь ${message.user} покинул чат`);
  } else if (message.type === "text") {
    addMessage(message);
  }
}

function addSystMessage(message) {
  const messageItem = document.createElement("div");
  messageItem.className = "message-system";

  messageItem.textContent = message;

  chatBody.appendChild(messageItem);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addMessage(message) {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, 0);
  const minutes = String(date.getMinutes()).padStart(2, 0);
  const time = `${hours}:${minutes}`;

  const messageHTML = tempMessage({
    name: message.user,
    time: time,
    text: message.text,
    src: message.src || undefined,
  });

  chatBody.innerHTML += messageHTML;
  const lastMessageImg = chatBody.lastElementChild.querySelector(".user-img");
  const lastMessage = lastMessageImg.parentNode;
  lastMessageImg.dataset.img = message.user;
  lastMessage.dataset.user = message.user;

  if (!message.me) {
    lastMessage.classList.add("message_not-mine");
  }

  if (
    lastMessage.previousElementSibling &&
    lastMessage.previousElementSibling.dataset.user === message.user
  ) {
    lastMessage.classList.add("message_not-first");
  } else {
    lastMessage.style.marginTop = "30px";
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

function printUsers() {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  const chatCounter = document.querySelector(".chat__counter");
  chatCounter.textContent = `Участников: ${users.size} `;

  [...users.values()].forEach(({ user, src }) => {
    const userHTML = tempUser({
      name: user,
      src: src || undefined,
    });
    userList.innerHTML += userHTML;

    if (chatBody.children && src) {
      const currUserMsgIMGS = chatBody.querySelectorAll(`[data-img=${user}]`);
      if (currUserMsgIMGS) {
        currUserMsgIMGS.forEach((img) => {
          img.style.backgroundImage = `url(${src})`;
          img.style.backgroundSize = "cover";
        });
      }
    }
  });
}

doLogin();
