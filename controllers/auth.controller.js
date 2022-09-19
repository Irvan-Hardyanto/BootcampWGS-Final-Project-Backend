//controller untuk login/daftar pengguna baru:
//Pada arsitektur MVC, Controller itu menjadi 'perantara' antara Model dan View

//import modul-modul yang dibutuhkan
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

//import modul-modul buatan sendiri
const db=require("../models");
const config=require("../config/auth.config");

//mengubah nama atribut 'user' dan 'refreshToken' dari objek db
const { user: User, refreshToken: RefreshToken } = db;

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
    }).then(async(user)=>{
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
        
        //generate access token
        const accessToken=jwt.sign(payload,config.jwtSecretKey,{
            expiresIn:config.expiresIn
        });

        //generate refresh token
        let refreshToken = await RefreshToken.createToken(user);

        //kirim token yang sudah di generate
        res.status(200).send({
            id: userID,
            userName,
            name,
            role,
            accessToken,
            refreshToken
        })
    }).catch(err=>{
        res.status(500).send({ message: err.message });
    })
}

//function untuk memverifikasi refresh token yang dimiliki oleh pengguna dan menghasilkan refresh token baru
const refreshToken = async(req,res)=>{
    const requestToken=req.body.refreshToken;

    //jika tidak ada refresh token yang dilampirkan, tampikan pesan kesalahan
    if (requestToken == null) {
        //403: Forbidden, pengguna ini tidak diizinkan untuk mengakses resource
        return res.status(403).json({ message: "Refresh Token is required!" });
    }

    try{
        let refreshToken = await RefreshToken.findOne({where:{token:requestToken}});
        if(!refreshToken){
            //403: Forbidden, pengguna ini tidak diizinkan untuk mengakses resource
            return res.status(403).json({ message: "Refresh token is not in database!" });
        }

        //jika refresh token yang dimiliki oleh pengguna sudah kedaluarasa (expired)
        if(RefreshToken.verifyExpiration(refreshToken)){
            //hapus token dari tabel 'refreshTokens'
            RefreshToken.destroy({where:{id: refreshToken.id}});

            res.status(403).json({
                message: "Refresh token was expired. Please make a new signin request",
            });
            return;
        }
        
        let newAccessToken= jwt.sign({id:refreshToken.userId},config.jwtSecretKey,{
            expiresIn: config.expiresIn
        });

        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken.token
        })
    }catch(err){
        return res.status(500).send({ message: err });
    }
}

module.exports={signin,signup,refreshToken};