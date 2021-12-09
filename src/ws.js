const ws = new WebSocket("ws://127.0.0.1:8080");

ws.onconnection = (ev) => {
  ws.onmessage = (ev) => {
    let message = ev.data;
    console.log(message);
  };

  ws.onclose = (ev) => {
    console.log("end");
  };
};
