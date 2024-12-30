const express = require('express');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const path = require('path');

// Create an Express app
const app = express();
const port = 3000;

// Serve static files (like your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// MQTT Configuration
const mqttBroker = 'mqtt://broker.hivemq.com'; // Public MQTT broker
const client = mqtt.connect(mqttBroker);

// MQTT Topics
const cryTopic = 'home/alert/babycry';  // Baby cry alert
const servoTopic = 'home/control/servoSpeed';  // Servo control topic
const tempTopic = 'home/sensors/temperature';  // Temperature topic
const humiTopic = 'home/sensors/humidity';  // Humidity topic

// WebSocket server configuration
const wss = new WebSocket.Server({ port: 8080 });

// MQTT Client setup
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Subscribe to MQTT topics
    client.subscribe([cryTopic, tempTopic, humiTopic,servoTopic], (err) => {
        if (!err) {
            console.log('Subscribed to cry, temperature, and humidity topics and servo speed');
        } else {
            console.error('Subscription error:', err);
        }
    });
});

// Handling incoming MQTT messages
client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    
    // Broadcast MQTT messages to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ topic, message: message.toString() }));
        }
    });
});

// WebSocket connections
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    // Send a message when a WebSocket client connects
    ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
    
    // Handle messages from the WebSocket client (like servo control)
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        // Handle servo control
        if (data.topic === 'servo') {
            console.log(`Received servo command: ${data.command}`);
            if (data.command === 'slow' || data.command === 'medium' || data.command === 'fast') {
                // Publish the servo control command to MQTT broker
                client.publish(servoTopic, data.command);
            } else if (data.command === 'stop') {
                // Publish stop servo command to MQTT broker
                client.publish(servoTopic, 'stop');
            }
        }
    });
});
