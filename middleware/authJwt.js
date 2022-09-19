const jwt = require("jsonwebtoken");
const configuration= require("../config/auth.config");
const {TokenExpiredError}=jwt;

//bukan middleware, bukan juga callback yang biasa dipake
const catchTokenExpiredError=(err,res)=>{
    if(err instanceof TokenExpiredError){
        return res.status(401).send({msg: "Unauthorized! Access Token was expired!"});
    }
    return res.status(401).send({msg:"Unauthorized"});
}

//middleware untuk memverifikasi jwt
//dipanggil ketika user akan membuka halaman tertentu
const verifyUserToken=(req,res,next)=>{//ada parameter next karena ini adalah middleware
    const token = req.headers["x-access-token"];

    if(!token){//jika tidak ada jwt pada request header
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token,configuration.jwtSecretKey,(err,decoded)=>{
        if(err){
            return res.status(401).send({
                message: "Token expired!"
            })
        }
        req.userId=decoded.id;
        next();//biar gak stuck
    });
};

const isCustomer=(req,res,next)=>{
    
}

const isAdmin=(req,res,next)=>{

}

const isSuperAdmin=(req,res,next)=>{

}

const authJwt={
    verifyUserToken:verifyUserToken,
    isCustomer:isCustomer,
    isAdmin:isAdmin,
    isSuperAdmin:isSuperAdmin,
}

module.exports =authJwt;