"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const redisClient_1 = __importDefault(require("./redisClient"));
const app = (0, express_1.default)();
const port = 3000;
app.get("/", (req, res) => {
    res.send("Chat Server is Running");
});
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (ws) => {
    console.log("Client connected");
    redisClient_1.default.lRange("chat_message", 0, -1).then((messages) => {
        messages.forEach((message) => {
            ws.send(message);
        });
    }, (error) => {
        console.error("Error retrieving msg fro redis", error);
        return;
    });
    ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        message.timestamp = Date.now();
        const messageString = JSON.stringify(message);
        redisClient_1.default.rPush("chat_messages", messageString);
        redisClient_1.default.lTrim("chat_messages", -100, -1);
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(messageString);
            }
        });
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
console.log("WebSocket server is running on ws://localhost:3000");
