import express from "express"
import { WebSocketServer } from "ws"
import redisClient from "./redisClient"
import { ChatMessage } from "./chatMessage"
import path from "path";

const app = express()
const port = 3000
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html when the user accesses the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(port , ()=>{
  console.log(`Server is running on port ${port}`)
});

const  wss = new WebSocketServer({server});

wss.on("connection",(ws)=>{
  console.log("Client connected");

  redisClient.lRange("chat_message",0,-1).then(
    (messages)=>{
      messages.forEach((message)=>{
        ws.send(message)
      })
},
(error)=>{
  console.error("Error retrieving msg fro redis", error)
  return
}

);

ws.on("message" , (data) =>{
  const message:ChatMessage = JSON.parse(data.toString());
  message.timestamp= Date.now();
  const messageString = JSON.stringify(message);


  redisClient.rPush("chat_messages" , messageString);
  redisClient.lTrim("chat_messages", -100,-1);

  wss.clients.forEach((client) =>{
    if(client.readyState === ws.OPEN){
      client.send(messageString)
    }
  });
});

ws.on("close" ,() =>{
  console.log("Client disconnected")
})




})


console.log("WebSocket server is running on ws://localhost:3000");