// Construct WebSocket URL using environment variables
const websocketProtocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
const websocketPort = process.env.WDS_SOCKET_PORT || 443; // Default to 443 if environment variable is not set
const websocketURL = `${websocketProtocol}://${window.location.hostname}:${websocketPort}/ws`;

// Connect to WebSocket server
const ws = new WebSocket(websocketURL);

// Event handlers for WebSocket events
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
