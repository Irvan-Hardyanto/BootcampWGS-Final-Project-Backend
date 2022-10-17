const db=require("../models");
const path = require('node:path');
const { payment: Payment} = db;

const addPayment=(req,res)=>{
	//harusnya payment untuk tiap transaksi itu cuma bisa satu
	Payment.create({
		userId: parseInt(req.body.userId),
		items: req.body.items,
		nominal: parseInt(req.body.nominal),
		paymentConfirmation: req.file.path,
		paid: false
	}).then(pay=>{
		res.status(200).send();
	}).catch(err=>{
		console.log(err);
		res.status(500).send();
	})
}

//tampilkan semua, literally semua data pembayaran yang ada di tabel
//kalo rekord nya udah jutaan butuh kasus khusus (?)
const getAllPaymentData=(req,res)=>{
	Payment.findAll({
		attributes: ['id','userId','items','nominal','paid','createdAt','updatedAt'],
	}).then(payments=>{
		return res.status(200).send(payments);
	}).catch(err=>{
		console.log();
		return res.sendStatus(500);
	})
}

//cari data transaksi tertentu
//route nya harus ada param paymentId!
const finishPayment=(req,res)=>{
	Payment.findOne({
		attributes:['id','userId','items','nominal','paid','createdAt','updatedAt'],
		where:{
			id: parseInt(req.params.paymentId)
		}
	}).then(payment=>{
		if(!payment){
			return res.status(400).send(Array({msg:"Payment not found!",param:"userId"}));
		}else{
			payment.update({
				paid: true	
			}).then(succ=>{
				return res.status(200).send();
			})
		}
	}).catch(err=>{
		console.log(err);
		res.sendStatus(500);
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
		res.sendStatus(500);
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
		res.status(500).send();
	})
}

module.exports={addPayment,getAllPaymentData,finishPayment,findPaymentByUserId,getPaymentConfirmation};