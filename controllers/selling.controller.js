//import model nya
const { selling : Selling } = require("../models");

//POST
//asumsi di sini request nya udah valid
const insertSellingData = (req,res)=>{
	let items=[];
	for (let item of req.body.items){
		items.push({
			paymentId: item.paymentId,
			productId: item.productId,
			productName: item.productName,
			productPrice: item.productPrice,
			quantity: item.qty,
			totalPrice: item.totalPrice
		})
	}
	Selling.bulkCreate(items).then(rows=>{
		res.status(200).send();
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}

//GET
const getAllSellingData = (req,res)=>{
	let obj = {
		attributes:[
			'id',
			'paymentId',
			'productId',
			'productName',
			'productPrice',
			'quantity',
			'totalPrice',
			'createdAt',
			'updatedAt'
		]
	};
	if(req.query.orderby && req.query.order){
		obj.order=[[req.query.orderby,req.query.order]];
	}
	Selling.findAll(obj).then(rows=>{
		res.status(200).send(rows)
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}

module.exports={insertSellingData,getAllSellingData};