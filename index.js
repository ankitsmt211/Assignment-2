const express = require('express')
const mongoose = require('mongoose')

const userRoutes = require('./routes/user/user')
const postRoutes = require('./routes/posts/posts')
const PORT = 3000

const server = express()

server.use(express.json())
server.use(userRoutes)
server.use(postRoutes)

async function connect(){
   try{
    const status = await mongoose.connect('mongodb://127.0.0.1:27017/instaclone')
    console.log("successfully connected to db")
   }
   catch(err){
    console.log("unable to connect to db",err)
   }
}

connect()

server.listen(PORT,()=>{
    console.log("server is running...")
})