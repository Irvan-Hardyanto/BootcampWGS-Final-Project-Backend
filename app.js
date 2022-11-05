// import modul-modul yang dibutuhkan
const express=require('express');
const multer  = require('multer');
const { faker } = require('@faker-js/faker');
var morgan = require('morgan');
const cors = require('cors');
var corsOptions = {
    origin:'http://localhost:3000'
};

//import modul-modul buatan sendiri
const db=require('./models');
const middlewares =require("./middleware");
const authController=require('./controllers/auth.controller');
const productController=require('./controllers/product.controller');
const cartController=require('./controllers/cart.controller');
const paymentController=require('./controllers/payment.controller');
const sellingController=require('./controllers/selling.controller');
const userController=require('./controllers/user.controller');
const logController=require('./controllers/log.controller');

//middleware untuk menangani upload file via form
//penjelasan singkatnya: https://github.com/expressjs/multer#readme
//TODO: Kalau yang diupload itu foto customer, simpan gambarnya /pictures/customers,
//kalau yang diupload itu foto produk, simpan gambarnya /pictures/products,
const upload = multer({dest:'./public/pictures/'});

const pool = require("./db");//untuk koneksi ke database

//inisialisasi objek express.js
const app = express();
const port = 9000;//port number

const Role = db.role;
//sb.sequelize itu untuk membuat tabel-tabel yang didefinisikan di berkas ../models/index.js
db.sequelize.sync().then(succ=>{

}).catch(err=>{
    //console.log(err);
});
//midleware
//supaya requestnyadikonversike json
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
// app.use(middlewares.morganMiddleware);
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

app.options('/products', cors(corsOptions))
app.get('/products',cors(corsOptions),productController.getAllProduct);
app.post('/products',[cors(corsOptions),upload.single('image')],productController.addProduct)

app.options('/products/:productId', cors(corsOptions))
//route untuk melihat detail produk tertentu
app.get('/products/:productId',[cors(corsOptions)],productController.getProductById)
app.put('/products/:productId',[cors(corsOptions),upload.single('image')],productController.updateProduct)

//tambahin route PUT sama DELETE buat hapus barang

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

//untuk preflight request
app.options('/users',cors(corsOptions));
// '/users?role=3 untuk daftar customer'
// '/users?role=2 untuk daftar admin'
// '/users?role=1 untuk daftar superadmin'
app.get('/users',[cors(corsOptions)],userController.getUsers);
app.put('/users',[cors(corsOptions)],userController.modifyUserRole);
app.options('/users/:id',cors(corsOptions));
app.delete('/users/:id',[cors(corsOptions)],userController.deleteUser);


app.options('/carts', cors(corsOptions));
//route untuk membuat 'keranjang' baru
app.post('/carts',[cors(corsOptions)],cartController.createCart);

//route untuk mengambil semua barang yang ada di dalam 'keranjang belanja' milik klien tertentu
app.get('/carts',[cors(corsOptions)],cartController.getCart);

app.options('/carts/:userId', cors(corsOptions));
// route untuk mengupdate keranjang milik customer tertentu
app.put('/carts/:userId',[cors(corsOptions)],cartController.updateCart);

app.options('/payments',cors(corsOptions))
app.get('/payments',[cors(corsOptions)],paymentController.getAllPaymentData);

//enc type: multitype / form-data !!!
app.post('/payments',[cors(corsOptions),upload.single('paymentConfirmation')],paymentController.addPayment);


app.options('/payments/:paymentId',cors(corsOptions));
//untuk menandai kalau transaksinya sudah selesai
app.put('/payments/:paymentId',[cors(corsOptions)],paymentController.updatePaymentStatus);

app.options('/payments/image/:paymentId', cors(corsOptions));
app.get('/payments/image/:paymentId',[cors(corsOptions)],paymentController.getPaymentConfirmation);

app.options('/sellings',cors(corsOptions));
app.post('/sellings',[cors(corsOptions)],sellingController.insertSellingData);
app.get('/sellings',[cors(corsOptions)],sellingController.getSellingData);

app.options('/logs',cors(corsOptions));
app.get('/logs',[cors(corsOptions)],logController.getAllLogs);

app.options('/logs/download',cors(corsOptions));
app.get('/logs/download',[cors(corsOptions)],logController.downloadLog);
// app.put('/carts/:userId/')

// //route untuk menghapus keranjang beserta seluruh isinya milik user tertentu
// app.delete('/carts/:userId/')

// //route untuk menghapus produk tertentu dari keranjang belanja milik customer tertentu.
// app.delete('/carts/:userId/product/:productId')

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