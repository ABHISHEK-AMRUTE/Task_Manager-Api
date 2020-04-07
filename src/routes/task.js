const express = require('express')
const tasks =require('../models/tasks')
const app = new express.Router()
const auth = require('../middleware/auth')

/////////////creating task///////////////
app.post('/tasks',auth,async (req,res)=>{
    const new_task = new tasks({
        ...req.body,
        owner : req.user._id
    })
    
    try{
         await new_task.save()
         res.status(201).send(new_task)
    }catch(e){
         res.status(400).send(new_task)
    }
    
})




//////////Getting all the tasks///////
///pagination and queries
// GET /tasks?completed=true
// GET /tasks?limit=10&&skip=10
// GET /tasks?sortBy=createdAt:desc
// GET /tasks?sortBy=completed:desc
app.get('/tasks',auth,async (req,res)=>{
    try{
    // const results = await tasks.find({owner:req.user._id})  both approaches works
    const match={}

    if(req.query.completed)
    {
        match.completed = req.query.completed === 'true' 
    }
    const sort = {}
    if(req.query.sortBy){
        const parts =  req.query.sortBy.split(':')
        sort[parts[0]] =  parts[1] ==='desc' ? -1 : 1
    }
    await req.user.populate({
        path: 'tasks',
        match,
        options:{
           limit:parseInt(req.query.limit),
           skip:parseInt(req.query.skip),
           sort 
        
        }
    }).execPopulate()
    
    res.status(201).send(req.user.tasks)
    }catch(e){
        console.log(e)
    res.status(404).send()
    }
    
})

////////////Getting tasks by id/////////
app.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    try{
       const results = await  tasks.findOne({_id,owner:req.user._id})
       if(!results)
       {
           return res.status(404).send('task not found') 
       }
       res.status(500).send(results)
    }catch(e){
        res.status(404).send()
    }
    
    
             
})



////////////////Finding and updating tasks////////////
app.patch('/tasks/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowed = ['description','completed']
    const is_valid  = updates.every((update)=>allowed.includes(update))
    if(!is_valid)
    {
        return res.status(400).send('Invalid updates!')
    }
    try{
         const task_update = await tasks.findOne({_id:req.params.id,owner:req.user._id})
         
       // const task_update = await tasks.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    if(!task_update)
    {    
        return res.status(404).send('user not found')
    } 

    updates.forEach((update)=>task_update[update]=req.body[update])
    await task_update.save(); 
    res.status(200).send(task_update)
    }catch(e)
    {
         res.status(404).send('User action error')
         
    }
})

////////////delete task by id///////////////
app.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const del = await tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!del)
        {
            return res.status(404).send()
        }
        res.send(del) 
    }catch(e)
    {   console.log(e)
        res.status(500).send() 
    }
})

module.exports = app