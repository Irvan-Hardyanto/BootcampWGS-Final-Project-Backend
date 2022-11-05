const db=require("../models");
const path = require('node:path');
const productController= require('./product.controller')
const isNumber = require('is-number');
const { payment: Payment,sequelize } = db;
const ROWS_PER_PAGE = 5;
const addPayment=(req,res)=>{
	const purchasedProducts=JSON.parse(req.body.items);
	for(let item of purchasedProducts){
		productController.decreaseProductStock(item.productId,item.qty);
	}
	Payment.create({
		userId: parseInt(req.body.userId),
		items: req.body.items,
		nominal: parseInt(req.body.nominal),
		paymentConfirmation: req.file.path,
		paid: false
	}).then(pay=>{
		res.status(200).send('Payment Success!');
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}

//tampilkan semua, literally semua data pembayaran yang ada di tabel
//kalo rekord nya udah jutaan butuh kasus khusus (?)
const getAllPaymentData=(req,res)=>{
	const paid=req.query.paid==="true"?"True":"False";//true atau false
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	let searchQuery = req.query["search-query"] || "";//kueri pencarian log
	searchQuery=searchQuery.toLowerCase();

	const offset = page * rowsPerPage;//offset 

	const minTimestamp = req.query.min_timestamp || "";
	const maxTimestamp = req.query.max_timestamp || "";

	let totalRows = 0;
	let totalPage = 0;

	let query = '';

	if(searchQuery===""){
		query = `SELECT a.id,b.name,a.items,a.nominal,a.paid,a."createdAt",a."updatedAt" FROM "Payments" AS "a" INNER JOIN t_user AS "b" ON a."userId" = b.id WHERE a.paid=${paid} ORDER BY a."createdAt" DESC`;
	}else if(isNumber(searchQuery)){
		query = `SELECT a.id,b.name,a.items,a.nominal,a.paid,a."createdAt",a."updatedAt" FROM "Payments" AS "a" INNER JOIN t_user AS "b" ON a."userId" = b.id WHERE a.paid=${paid} AND (a.nominal=${searchQuery}) ORDER BY a."createdAt" DESC`;
	}else{
		query = `SELECT a.id,b.name,a.items,a.nominal,a.paid,a."createdAt",a."updatedAt" FROM "Payments" AS "a" INNER JOIN t_user AS "b" ON a."userId" = b.id WHERE a.paid=${paid} AND (LOWER(b.name) LIKE '%${searchQuery}%') ORDER BY a."createdAt" DESC`;
	}
	//hitung jumlah seluruh rekord yang ada
	sequelize.query(query).then(([results])=>{
		totalRows = results.length;
		totalPage =  Math.ceil(results.length / rowsPerPage);
		return sequelize.query(query+` OFFSET ${offset} LIMIT ${rowsPerPage}`);
	}).then(([results])=>{
		return res.status(200).send({
			result:results,
			page: page,
			rowsPerPage: rowsPerPage,
			totalRows:totalRows,
			totalPage: totalPage
		});
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(err);
	})
}

//cari data transaksi tertentu
//route nya harus ada param paymentId!
//kurangin stok barang yang dibeli customer
const updatePaymentStatus=(req,res,action)=>{
	Payment.findOne({
		attributes:['id','userId','items','nominal','paid','createdAt','updatedAt'],
		where:{
			id: parseInt(req.params.paymentId)
		}
	}).then(payment=>{
		if(!payment){
			return res.status(400).send(Array({msg:"Payment not found!",param:"paymentId"}));
		}else{
			if(action==='finish'){
				//tandai transaksi sudah selesai
				payment.update({
					paid: true	
				}).then(succ=>{
					return res.status(200).send();
				})
			}else if(action==='undo'){
				//batalkan transaksi yang sudah selesai
				payment.update({
					paid: false	
				}).then(succ=>{
					//Hapus selling data nya....
					return res.status(200).send();
				})
			}else{
				return res.status(400).send(Array({
					msg:'Invalid query string!!!'
				}))
			}
		}
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}


//ini param di query nya itu userId
const findPaymentByUserId=(req,res)=>{
	//cari semua transaksi pembayaran milik customer tertentu
	//baik yang sudah lunas maupun belum lunas
	Payment.findAll({
		attributes:['id','userId','items','nominal','paid','createdAt','updatedAt'],
		where:{
			userId: parseInt(req.params.userId)
		}
	}).then(paymentRecords=>{
		return res.status(200).send(paymentRecords);
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}
const getPaymentConfirmation=(req,res)=>{
	Payment.findOne({
		attributes:['paymentConfirmation'],
		where:{
			id:parseInt(req.params.paymentId)
		}
	}).then(payment=>{
		res.status(200).sendFile(path.join(__dirname, '..',payment.paymentConfirmation));
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}

module.exports={addPayment,getAllPaymentData,updatePaymentStatus,findPaymentByUserId,getPaymentConfirmation};