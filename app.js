// WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');

// Function to send servo control commands with speed
function sendServoCommand(speed) {
    const message = {
        topic: 'servo',
        command: speed
    };
    socket.send(JSON.stringify(message));
}

// Handle incoming messages from the WebSocket server
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Message received from server:', data);

    // Handle alerts or feedback from the server
    if (data.topic === 'home/alert/babycry') {
        alert('Baby is crying!');
        // Automatically start the servo when baby cries
        sendServoCommand('medium'); // Default to medium speed when baby cries
    }

    // Handle temperature and humidity updates
    if (data.topic === 'home/sensors/temperature') {
        document.getElementById('temperature').innerText = data.message + ' °C';
    }

    if (data.topic === 'home/sensors/humidity') {
        document.getElementById('humidity').innerText = data.message + ' %';
    }
};

// Handle WebSocket connection open
socket.onopen = function() {
    console.log('WebSocket connection established');
};

// Handle WebSocket errors
socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};
