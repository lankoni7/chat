const WebSocket = require("ws");
const wsServer = new WebSocket.Server({ port: 9000 });

wsServer.on("connection", onConnect);

const connections = new Map();

function onConnect(ws) {
  console.log("New user connected");
  connections.set(ws, {});

  ws.on("message", function (stringMessage) {
    message = JSON.parse(stringMessage);
    let excludeItself = false;

    if (message.type === "hello") {
      excludeItself = true;
      connections.get(ws).user = message.user;
    }

    if (message.type === "text") {
      message.src = connections.get(ws).photo || "";
      sendMsgToClient(message, ws);
    } else {
      connections.get(ws).photo = message.src;
      const newMessage = {
        type: "user-list",
        data: [...connections.values()].map((item) => ({
          user: item.user,
          src: item.photo || "",
        })),
      };
      sendMsgToClient(newMessage, ws);
      sendMsgToClient(message, ws, excludeItself);
    }
  });

  ws.on("close", function () {
    sendMsgToClient({ type: "bye" }, ws);
    connections.delete(ws);
  });
}

function sendMsgToClient(message, ws, excludeItself) {
  const thisWs = connections.get(ws);
  message.user = thisWs.user;

  for (const connection of connections.keys()) {
    if (connection === ws && excludeItself) {
      continue;
    } else if (connection === ws) {
      message.me = true;
    } else {
      message.me = false;
    }
    connection.send(JSON.stringify(message));
  }
}

console.log("Serv started on port 9000");
