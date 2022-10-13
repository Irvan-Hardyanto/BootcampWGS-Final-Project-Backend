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
    User.findOne({//cari user dengan username yang dimasukkan oleh pengguna
        where:{
            userName:req.body.userName
        }
    }).then(user=>{
        if(user){
            return res.status(400).send(Array({msg: "this username is already used!",param:"userName"}));
        }else{
            return User.create({
                userName: req.body.userName,
                name:req.body.name,
                password: bcrypt.hashSync(req.body.password, 8),
                role:3
            })
        }
    }).then(user=>{
        return res.status(200).send({
            msg:"sign up completed!",
            id:user.id
        })
    }).catch(err=>{
        return res.status(400).send(Array({msg: err,param:"query or db related error"}));
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
            return res.status(404).send(Array({msg:"User not found!",param:"userName"}));
        }

        //periksa apakah password yang dimasukkan sudah benar
        if(!bcrypt.compareSync(req.body.password,user.password)){
            return res.status(401).send(Array({
                accessToken:null,
                msg:"wrong Password!",
                param:"password"
            }));
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

        //kirim token yang sudah di generate ke halaman login, ntar kalo gak ada error, 
        res.status(200).send({
            id: userID,
            role,
            accessToken,
            refreshToken
        })
    }).catch(err=>{
        res.status(500).send(Array({ msg: err.message,param:"other"}));
    })
}

//function untuk memverifikasi refresh token yang dimiliki oleh pengguna dan menghasilkan refresh token baru
const refreshToken = async(req,res)=>{
    const requestToken=req.body.refreshToken;

    //jika tidak ada refresh token yang dilampirkan, tampikan pesan kesalahan
    if (requestToken == null) {
        //403: Forbidden, pengguna ini tidak diizinkan untuk mengakses resource
        return res.status(403).json({ msg: "Refresh Token is required!" });
    }

    try{
        let refreshToken = await RefreshToken.findOne({where:{token:requestToken}});
        if(!refreshToken){
            //403: Forbidden, pengguna ini tidak diizinkan untuk mengakses resource
            return res.status(403).json({ msg: "Refresh token is not in database!" });
        }

        //jika refresh token yang dimiliki oleh pengguna sudah kedaluarasa (expired)
        if(RefreshToken.verifyExpiration(refreshToken)){
            //hapus token dari tabel 'refreshTokens'
            RefreshToken.destroy({where:{id: refreshToken.id}});

            res.status(403).json({
                msg: "Refresh token was expired. Please make a new signin request",
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
        return res.status(500).send({ msg: err });
    }
}

module.exports={signin,signup,refreshToken};