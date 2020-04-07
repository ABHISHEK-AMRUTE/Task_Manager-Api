const User =require('../models/user')
const jwt = require('jsonwebtoken')
const auth = async (req,res,next)=>{
   try{ const token = req.header('Authorization').replace('Bearer ','')
    const decoded_data = jwt.verify(token,process.env.JWT_CODE)
    const user = await User.findOne({_id:decoded_data._id,'tokens.token':token})
      if(!user)
    {
      throw new Error()
    }
    req.token =token
     req.user = user
    next()
    }
    catch(e)
    {
        res.status(401).send('Please authenticate')
    } 
}

module.exports = auth