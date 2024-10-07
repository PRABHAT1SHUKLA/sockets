import express from "express"
import { WebSocketServer } from "ws"
import redisClient from "./redisClient"
import { ChatMessage } from "./chatMessage"


const app = express()
const port = 3000

app.get("/" , (req,res) =>{
  res.send("Chat Server is Running")
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