// import modul-modul yang dibutuhkan
const express=require('express');
const multer  = require('multer');
const { faker } = require('@faker-js/faker');
const cors = require('cors');
var corsOptions = {
    origin:'http://localhost:3000'
};

//import modul-modul buatan sendiri
const db=require('./models');
const middlewares =require("./middleware");
const authController=require('./controllers/auth.controller');
const productController=require('./controllers/product.controller');

//middleware untuk menangani upload file via form
//penjelasan singkatnya: https://github.com/expressjs/multer#readme
//TODO: Kalau yang diupload itu foto customer, simpan gambarnya /pictures/customers,
//kalau yang diupload itu foto produk, simpan gambarnya /pictures/products,
const upload = multer({dest:'./public/pictures/'});

const pool = require("./db");//untuk koneksi ke database

//inisialisasi objek express.js
const app = express();
const port = 9000;//port number

const Product = db.product;

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

//dikutip dari laman w3schools.com
//https://www.w3schools.com/js/js_random.asp
// function getRndInteger(min, max) {
//     return Math.floor(Math.random() * (max - min + 1) ) + min;
//   }

// const generateDummyProductData=(productNum,Product)=>{
    
//     for(let i=0;i<=productNum;i++){
//         Product.create({
//             name: faker.commerce.productName(),
//             description: faker.commerce.productDescription(),
//             price: getRndInteger(10000,100000),
//             stock: getRndInteger(1,100),
//             unit:''
//         });
//     }  
// }
db.sequelize.sync().then(succ=>{
    
}).catch(err=>{
    //console.log(err);
});
//midleware
//supaya requestnyadikonversike json
app.use(express.json());
app.use(express.urlencoded({extended:true}));
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
app.get('/test',(req,res)=>{
    res.render(__dirname + '/views/test-gambar.ejs')
})
//route default ke dashboard
app.get('/',(req,res)=>{
    
})

//untuk CORS preflight
app.options('/login', cors(corsOptions))

//route untuk login
//enctype: application/x-www-form-urlencoded
app.post('/login',[cors(corsOptions),middlewares.validators.loginDataValidator,middlewares.validators.verifyLoginData],authController.signin);

app.options('/register', cors(corsOptions))
app.post('/register',[cors(corsOptions),middlewares.validators.registerDataValidator,middlewares.validators.verifyRegisterData],authController.signup);

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

app.options('/customer/productlist', cors(corsOptions))
app.get('/customer/productlist',cors(corsOptions),productController.getAllProduct);

app.options('/product/add', cors(corsOptions))
app.post('/product/add',[cors(corsOptions),upload.single('image')],productController.addProduct)

//route untuk melihat detail produk tertentu
app.get('/product/detail',[upload.none(),middlewares.authJwt.verifyUserToken],(req,res)=>{//+id produk 

})

app.options('/product/picture/:productId', cors(corsOptions))
//route untuk merespons permintaan gambar produk tertentu
app.get('/product/picture/:productId',[cors(corsOptions)],productController.getProductImage);
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