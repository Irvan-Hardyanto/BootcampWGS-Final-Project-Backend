//import model-model yang dibutuhkan
const db=require("../models");
const User=db.user;

//middleware untuk memeriksa username yang digunakan oleh pengguna(user) untuk mendaftar
const checkDuplicateUsername=(req,res,next)=>{
    User.findOne({
        where:{
            userName: req.body.userName
        }
    }).then(user=>{
        if(user){
            res.status(400).send({
                message:'this username is already used!'
            })
            return;
        }
        next();
    })
}

module.exports={checkDuplicateUsername}