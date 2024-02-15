const express = require('express')
const userModel = require('../../models/user')
const jwt = require('jsonwebtoken')

const routes = express.Router()

routes.post('/register', async (req,res)=>{
    //name,email,password
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password

    let matchingEmail = await userModel.findOne({email:email})

    if(matchingEmail){
        res.statusCode=400
        res.send({
            status:"failure",
            message:"email should be unique"
        })
        return
    }

    let registeredUser = new userModel({name:name,email:email,password:password})

    try{
        const user = await registeredUser.save()

        res.json({
            status:"success",
            data:user
        })
    }

    catch(err){
        console.log("unable to save user",err)
        res.statusCode=500
        res.send({
            status:"failure",
            message:"unable to save user to db"
        })
    }
})

function generateToken(userEmail){
    const payload = userEmail
    const secret = 'secret-key'

    return jwt.sign(payload,secret)
}

routes.post('/login',async (req,res)=>{
    let email = req.body.email
    let password = req.body.password


    try{
       let foundUser = await userModel.findOne({
            email:email,
            password:password
        })

        if(foundUser){
            const generatedToken = generateToken(email)
            res.statusCode=200
            res.send({
                status:"success",
                token:generatedToken
            })

            return
        }

        else{
            res.statusCode=200
            res.send({
                status:"success",
                message:"no user with that email/password exists"
            })

            return
        }
    }

    catch(err){
        res.statusCode=500
        res.send({
            status:"failure",
            message:"unable to find user, try again later"
        })
    }
})


module.exports = routes