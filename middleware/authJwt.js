const jwt = require("jsonwebtoken");
const configuration= require("../config/auth.config");

//middleware untuk memverifikasi jwt
const verifyUserToken=(req,res,next)=>{//ada parameter next karena ini adalah middleware
    const token = req.headers["x-access-token"];

    if(!token){
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    jwt.verify(token,configuration.jwtSecretKey,(err,decoded)=>{
        if(err){
            return res.status(401).send({
                message: "No token provided!"
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