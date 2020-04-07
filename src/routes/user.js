const User =require('../models/user')
const express = require('express')
const app = new express.Router()

const auth = require('../middleware/auth')
const multer = require('multer')

const upload = multer({
   
    limits :{
        fileSize : 4000000

    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('File must be .jpg,.jpeg or .png'))
        }
        cb(undefined,true)
    }
   
})
////////////Creating users//////////////////and signup/////////////
app.post('/user',async (req,res)=>
{   const new_user = new User(req.body)
    try{
        await new_user.save()
        const jwtoken = await new_user.generateAuthToken()
        res.status(201).send({new_user,jwtoken})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
   
})
///////login////////////
app.post('/user/login',async(req,res)=>{
    try{
     const user = await User.findByCredentials(req.body.email,req.body.password)
     const jwtoken = await user.generateAuthToken()
     res.send({user,jwtoken})
    }
    catch(e){
res.status(400).send()
    }
})



///////////logout///////////////
app.post('/user/logout',auth,async(req,res)=>
{
    try{
      req.user.tokens = req.user.tokens.filter((token)=>{
          return token.token!==req.token
      })
      await req.user.save()
      res.send()
    }catch(e)
    {
           res.status(500).send()
    }
})

///////////logout all sessions///////////////
app.post('/user/logoutall',auth,async(req,res)=>
{
    try{
      req.user.tokens = []
      await req.user.save()
      res.send()
    }catch(e)
    {
           res.status(500).send()
    }
})

//////////Getting profile of  the users//////////
app.get('/user/me',auth,async (req,res)=>{
    console.log(req.user)
    res.send(req.user)
    
})



///////////Finding and updating user////////////
app.patch('/user/me',auth,async (req,res)=>{
    const updates  = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'})
    }
    try{
       
        updates.forEach((update)=> req.user[update] = req.body[update] )
        await req.user.save()
       
        res.status(200).send(req.user)
    }catch(e)
    {     console.log(e)
         res.status(404).send('User Profile updation error')
    }


})

////////////delete user by id///////////////
app.delete('/user/me',auth,async (req,res)=>{
    try{
    
        await req.user.remove()
        res.send(req.user) 
    }catch(e)
    {   console.log(e)
        res.status(500).send() 
    }
})
///////////Uploading avatar
app.post('/user/me/profile',auth,upload .single('avator'),async (req,res)=>{
    req.user.avatar = req.file.buffer
    await req.user.save()
     res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
//////////deleting avator///////////

app.delete('/user/me/profile',auth,async (req,res)=>{
     req.user.avatar= undefined
    await req.user.save()
     res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


/////////fetching image////////
app.get('/user/:id/avator',async (req,res)=>{
    try{
         const user = await User.findById(req.params.id)
         if(!user || ! user.avatar)
         {
             throw new Error()
         }
         res.set('Content-Type','image/jp')
         res.send(user.avatar)
    }catch(e)
    {
          res.status(404).send()
    }
})
module.exports = app