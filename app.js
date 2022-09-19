// import modul-modul yang dibutuhkan
const express=require('express');
const session=require('express-session');
const { body,validationResult,check } = require('express-validator');
const multer  = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { Sequelize, DataTypes, Model } = require('sequelize');//untuk ORM


//import modul-modul buatan sendiri
const db=require('./models');
const middlewares =require("./middleware");
const authController=require('./controllers/auth.controller');

//middleware untuk menangani upload file via form
//penjelasan singkatnya: https://github.com/expressjs/multer#readme
//TODO: Kalau yang diupload itu foto customer, simpan gambarnya /pictures/customers,
//kalau yang diupload itu foto produk, simpan gambarnya /pictures/products,
const upload = multer({dest:'./public/pictures/'});

const pool = require("./db");//untuk koneksi ke database

//inisialisasi objek express.js
const app = express();
const port = 3000;//port number

const User = db.user;

//untuk mengisi database dengan data testing
// const seedUser=()=>{
//     User.create({
//         name: "Ghilbi Faqih",
//         userName: "ghilbi",
//         password: "indomie",
//         email:"ghilbi@gmail.com",
//         mobile:"088812341234",
//         photo:"/test",
//         role:3
//     });

//     User.create({
//         name: "Irvan Hardyanto",
//         userName: "irv98",
//         password: "osas",
//         email:"irvan@gmail.com",
//         mobile:"088812341234",
//         photo:"/test",
//         role:3
//     })

//     User.create({
//         name: "Adriana",
//         userName: "adrianaa",
//         password: "wgsisgood",
//         email:"adriana@gmail.com",
//         mobile:"088812341234",
//         photo:"/test",
//         role:3
//     })
// }

db.sequelize.sync().then(succ=>{

}).catch(err=>{
    //console.log(err);
});
//midleware
//supaya requestnyadikonversike json
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//route untuk menambahkan data tertentu ke dalam tabel tertentu, menggunakan kueri sql biasa
//Jika data dikirimkan dari sebuah form, pastikan metode 'enctype' nya di set ke: 'multipart/form-data'
const addRow=(tableName,data)=>{
    let queryString="";
    if(tableName==='t_user'){
        queryString=`INSERT INTO ${tableName} (name, "userName", password, email, mobile, photo, role)
	VALUES ('${data.body.name}','${data.body.userName}','${data.body.password}','${data.body.email}','${data.body.mobile}','${data.file.path}',${data.body.role});`;
    }else if(tableName==='t_product'){
        
    }
    return pool.query(queryString);
}

//menambahkan data ke dalam tabel customer menggunakan ORM
const addUser=(tableName,data)=>{

}

const executeQuery=(queryString)=>{
    return pool.query(queryString);
}

const loadRows=(tableName)=>{
    let queryString=`SELECT `
}

const getRows=(tableName)=>{
    
}

//route default ke dashboard
app.get('/',(req,res)=>{
    
})

//route untuk login
//NOTE!! middleware yg digunakan adalah multer, jadi perlu parameter tambahan di function post() / get()
//Jika data dikirimkan dari sebuah form, pastikan metode 'enctype' nya di set ke: 'multipart/form-data'
app.post('/login',[upload.none(),middlewares.validators.loginDataValidator,middlewares.validators.verifyLoginData],authController.signin);

// app.use(middlewares.validators.verifyRegisterData);
// app.use(middlewares.verifySignUp.checkDuplicateUsername);
app.post('/register',[upload.none(),middlewares.validators.registerDataValidator,middlewares.validators.verifyRegisterData],authController.signup);

app.post('/refreshToken',[upload.none()],authController.refreshToken);
//route untuk logout
app.get('/logout',(req,res)=>{

})

//route untuk melihat produk yang ada di dalam keranjang
app.get('/cart',[upload.none(),middlewares.authJwt.verifyUserToken],(req,res)=>{
    res.status(200).send('this is cart page');
})

//route untuk halaman detil akun
app.get('/profile',[upload.none(),middlewares.authJwt.verifyUserToken],(req,res)=>{

})

//route untuk melihat detail produk tertentu
app.get('/product/detail',[upload.none(),middlewares.authJwt.verifyUserToken],(req,res)=>{//+id produk 

})

//menambahkan user tententu entah itu customer,admin,ataupun superadmin
app.post('/user/add',upload.single('photo'),(req,res)=>{
    addRow('t_user',req).then(suc=>{
        res.send('data has succesfully added to table t_user')
    }).catch(err=>{
        res.send(err);
    });
})

// app.get('/user/delete/',upload.none(),(req,res)=>{

// })

app.post('/roles/add',(req,res)=>{
    addRow('t_role',req).then(succ=>{
        res.send('data has succesfully added to table t_role')
    }).catch(err=>{
        res.send(err)
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})