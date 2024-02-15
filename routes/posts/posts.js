const express = require('express')
const postModel = require('../../models/post')
const userModel = require('../../models/user')
const jwt = require('jsonwebtoken')

const routes = express.Router()

routes.get('/posts',authenticateToken,async(req,res)=>{

    let userEmail = req.userEmail

   try{
    let user = await userModel.findOne({email:userEmail})

    if(user){
        let userId = user._id
        let posts = await postModel.find({user:userId})
        res.statusCode=200
        res.send({
        posts:posts
    })
    return
    }

    res.statusCode=400
    res.send({
        status:"failure",
        message:"Not authorized"
    })
    return
   }

   catch(err){
    res.statusCode=500
    res.send({
        status:"failure",
        message:"server failed to process request"
    })
    return
   }
})

routes.post('/posts',authenticateToken,async (req,res)=>{
   let title = req.body.title
   let body = req.body.body
   let image = req.body.image

   let userEmail = req.userEmail
   console.log(userEmail)

   try{
    let user = await userModel.findOne({email:userEmail})
    let userId = user._id

    let createdPost = new postModel({title:title,body:body,image:image,user:userId})
    let savedPost = await createdPost.save()
    res.statusCode=200
    res.send({
        status:"Post Created",
        data:savedPost
    })
    return
   }
   catch(err){
    res.statusCode=500
    res.send({
        status:"failure",
        error:err.message
    })
    return
   }
})

routes.put('/posts/:postId',authenticateToken,async(req,res)=>{
    let userEmail = req.userEmail
    let postId = req.params.postId

    try{
        let verifiedUser = await userModel.findOne({email:userEmail})

        if(verifiedUser){
            let userId = verifiedUser._id

            console.log("looking for a post with id: ",postId)
            console.log("for user: ",userEmail)
            console.log("user id: ",userId)

            let targetPost = await postModel.findOne({_id:postId,user:userId})

            if(targetPost){
                //make changes and respond
                let title = req.body.title
                let body = req.body.body
                let image = req.body.image

                targetPost.title = title?title:targetPost.title
                targetPost.body = body?body:targetPost.body
                targetPost.image = image?image:targetPost.image

                let modifiedPost = await targetPost.save()

                if(modifiedPost){
                    res.statusCode=200
                    res.send(modifiedPost)
                    return
                }

                res.statusCode=500
                res.send({
                    status:"failure",
                    message:"unable to modify post, please try again"
                })
                return
            }

            res.statusCode=400
            res.send({
                status:"failure",
                message:`unauthorized to edit post with id: ${postId}`
            })
            return
        }
    }

    catch(err){
        res.statusCode=500
        res.send({
            status:"failure",
            message:"something went wrong, please try again",
            error:err.message
        })
    }

})

routes.delete('/posts/:postId',authenticateToken,async (req,res)=>{
    let postId = req.params.postId
    let userEmail = req.userEmail

    try{
        let verifiedUser = await userModel.findOne({email:userEmail})

        if(verifiedUser){
            let userId = verifiedUser._id

            let targetPost = await postModel.findOne({_id:postId,user:userId})

            if(targetPost){
                await postModel.deleteOne({_id:postId})
                res.statusCode=200
                res.send({
                    status:`post with id: ${postId} is successfully deleted.`
                })
    
                return
            }
           
        }

        res.statusCode=400
        res.send({
            status:"failure",
            message:`not authorized to delete post with id: ${postId}`
        })

        return
    }

    catch(err){
        res.statusCode=500
        res.send({
            status:"failure",
            message:"something went wrong, please try again",
            error:err.message
        })
        return
    }
})


function verifyToken(token){
    const secret = 'secret-key'

    try{
        const decodedPayload = jwt.verify(token,secret)
        return {
            success:true,
            data:decodedPayload
        }
    }
    catch(err){
        return {
            success:false,
            error:err.message
        }
    }
}

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        res.sendStatus(401)
        return
    }

    const payload = verifyToken(token)

    if(!payload.success){
        return res.status(403).json({ error: payload.error })
    }

    req.userEmail=payload.data
    console.log(req.userEmail)
    next()
}

module.exports = routes