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

  
})