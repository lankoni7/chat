import "./index.html";
import "./main.scss";

const ws = new WebSocket("ws://127.0.0.1:8080");
const user = new Set();
console.log(user);

const input = document.forms.chat;

function sendMessage(ev) {
  ev.preventDefault();
  let outgoingMessage = this.message.value;
  ws.send(JSON.stringify(outgoingMessage));
  outgoingMessage = "";
}

ws.onconnection = (ev) => {
  input.onsubmit = sendMessage;
  console.log(ev);
  ws.onmessage = (ev) => {
    let message = ev.data;
    console.log(message);
  };

  ws.onclose = (ev) => {
    console.log("end");
  };
};
