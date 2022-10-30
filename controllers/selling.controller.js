//import model nya
const { selling : Selling, sequelize } = require("../models");

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
const getCustomerPurchaseData = (req,res)=>{
	sequelize.query(`SELECT s."productName", SUM(s.quantity) AS "totPurchased"
					FROM "Payments" AS "p" INNER JOIN "Sellings" AS "s"
					ON p.id=s."paymentId"
					WHERE p."userId"=${parseInt(req.query.userid)}
					GROUP BY s."productName" `
	).then(([results])=>{
		res.status(200).send(results);
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}
//GET
const getAllSellingData = (req,res)=>{
	console.log('req.query.userId is : '+req.query.userid);
	if(req.query.userid!== undefined){
		getCustomerPurchaseData(req,res);
	}else{
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
	if(req.query.groupby){
		console.log('groupby query string detected..value is: '+req.query.groupby)
		//raw query
		let rawQuery="";

		const groupby=req.query.groupby;
		if(groupby==="product"){
			//tampilkan data selling berdasarkan nama produk
			rawQuery=`SELECT a."productId",a."productName", SUM(a.quantity) AS "totalProductSold"
						FROM "Sellings" AS "a"
						GROUP BY a."productId",a."productName"`;
			sequelize.query(rawQuery).then(([results])=>{
				res.status(200).send(results);
			}).catch(err=>{
				console.log(err)
				res.status(500).send(err);
			})
		}else if(groupby==="customer"){
			rawQuery=`SELECT "UsrPay"."customerId","UsrPay".name,SUM("Sellings".quantity) AS "totBuy",SUM("Sellings"."totalPrice") AS "totPaid"
FROM (SELECT a.id AS "customerId",a.name,b.id AS "paymentId"
FROM t_user AS "a" INNER JOIN "Payments" AS "b"
ON a.id=b."userId") AS "UsrPay" INNER JOIN "Sellings"
ON "UsrPay"."paymentId"="Sellings"."paymentId"
GROUP BY "UsrPay"."customerId","UsrPay".name`;
			sequelize.query(rawQuery).then(([results])=>{
				res.status(200).send(results);
			}).catch(err=>{
				console.log(err)
				res.status(500).send(err);
			})
		}else{
			return res.status(400).send('Invalid query!')
		}

	}else{
		Selling.findAll(obj).then(rows=>{
			res.status(200).send(rows)
		}).catch(err=>{
			console.log(err);
			res.status(500).send(err);
		})
	}
	}
}

module.exports={insertSellingData,getAllSellingData};