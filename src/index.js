const express =require('express')
require('./db/mongoose')

const user_route = require('./routes/user')
const task_route = require('./routes/task')
const bcryptjs = require('bcryptjs')
const app = express()

const port = process.env.PORT 


app.use(express.json())
app.use(user_route)
app.use(task_route)




app.listen(port,()=>{
    console.log('Server is up on port :'+port)
})

// const Task = require('./models/tasks')
// const User =require('./models/user')

// const main = async ()=>{
//   const user = await User.findById('5e8c057694571a1075f71f22')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }
// main()