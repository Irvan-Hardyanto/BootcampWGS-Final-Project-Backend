//controller untuk login/daftar pengguna baru:
//Pada arsitektur MVC, Controller itu menjadi 'perantara' antara Model dan View

//import modul-modul yang dibutuhkan
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

//import modul-modul buatan sendiri
const db=require("../models");
const config=require("../config/auth.config");
const User = db.user;

//untuk daftar
const signup=(req,res)=>{
    //tambahkan user baru ke dalam tabel
    User.create({
        userName: req.body.userName,
        name:req.body.name,
        password: bcrypt.hashSync(req.body.password, 8),
        role:3
    }).then(succ=>{
        res.status(200).send({
            message:"sign up completed!"
        })
    }).catch(err=>{
        res.status(400).send(err);
    })
}

//untuk login
const signin=(req,res)=>{
    User.findOne({//cari user dengan username yang dimasukkan oleh pengguna
        where:{
            userName:req.body.userName
        }
    }).then(user=>{
        if(!user){//jika tidak ada user dengan username yang dimasukkan oleh pengguna
            return res.status(404).send({message:"User not found!"});
        }

        //periksa apakah password yang dimasukkan sudah benar
        if(!bcrypt.compareSync(req.body.password,user.password)){
            return res.status(401).send({
                accessToken:null,
                message:"wrong Password!"
            });
        }

        //payload di acces token
        const userID=user.id;
        const userName=user.userName;
        const name=user.name;
        const role=user.role;

        const payload={userID};
        
        //generate jwt
        const accessToken=jwt.sign(payload,config.jwtSecretKey,{
            expiresIn:config.expiresIn
        });

        //kirim token yang sudah di generate
        res.status(200).send({
            id: userID,
            userName,
            name,
            role,
            accessToken
        })
    }).catch(err=>{
        res.status(500).send({ message: err.message });
    })
}

module.exports={signin,signup}