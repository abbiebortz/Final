// websocket.js
const protocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${location.host}/ws`);


ws.onopen = function(event) {
  console.log('WebSocket connection established');
};

ws.onmessage = function(event) {
  console.log('Message received:', event.data);
};

ws.onerror = function(error) {
  console.error('WebSocket error:', error);
};

ws.onclose = function(event) {
  console.log('WebSocket connection closed');
};
