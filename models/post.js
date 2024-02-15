const mongoose = require('mongoose')

const postSchema = new  mongoose.Schema({
    title:String,
    body:String,
    image:String,
    user:mongoose.Types.ObjectId
})

const postModel = mongoose.model('Post',postSchema)

module.exports = postModel