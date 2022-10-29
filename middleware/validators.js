//import module-module yang dibutuhkan
const { body,validationResult,check } = require('express-validator');
var bcrypt = require("bcryptjs");
const region = 'id-ID';//kode negara untuk validasi nomor telepon (mobile)

//username, name, password, dan confirmPassword tidak boleh kosong
//password harus sama dengan confirmPassword
const registerDataValidator=[
    check("userName","Please insert your username!").not().isEmpty(),
    check("password","Please insert your password!").not().isEmpty(),
    check("confPassword","Please type the password confirmation!").not().isEmpty(),
    check("name","Please insert your name!").not().isEmpty(),
];

const loginDataValidator=[
    //https://stackoverflow.com/a/50809691
    check("userName","Please insert your username and password!").not().isEmpty(),
    check("password","Please insert your username and password!").not().isEmpty()
]

//express-validator hanya bisa buat string
const addProductValidator=[
    check("name","Please insert product name!").not().isEmpty(),
    check("description","Please insert product description!").not().isEmpty(),
    check("price","Please insert product price!").not().isEmpty(),
    check("stock","Please insert product stock!").not().isEmpty(),
    check("image","Please upload product picture!").not().isEmpty(),
    check("unit","Please insert product unit!").not().isEmpty()
]

//middleware untuk validasi data produk yang ditambahkan
const validateProductData=(req,res,next)=>{
    let errorMessages =validationResult(req).array();
    if(errorMessages.length>0){
        return res.status(400).send(errorMessages);//kembalikan pesan kesalahan
    }
}

const verifyRegisterData=(req,res,next)=>{
    let errorMessages = validationResult(req).array();
    if(errorMessages.length>0){
        return res.status(400).send(errorMessages);//kembalikan pesan kesalahan
    }else if(req.body.password !== req.body.confPassword){//TODO:ganti jadi versi bcrypt
        errorMessages.push({
            'value': undefined,
            'msg': 'Incorrect password confirmation!',
            'param': 'confPassword',
            'location': 'function'
        })
        //kalau nanti front end udah beres, ganti jadi tampilkan pesan error
        return res.status(400).send(errorMessages);
    }
    next();//lanjutkan ke middleware berikutnya
}

//middleware untuk validasi data login
const verifyLoginData=(req,res,next)=>{
    let errorMessages = validationResult(req).array();
    if(errorMessages.length>0){
        return res.status(400).send(errorMessages);
    }
    next();
}

module.exports={addProductValidator,validateProductData,verifyRegisterData,verifyLoginData,loginDataValidator,registerDataValidator};