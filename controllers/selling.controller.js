//import model nya
const { selling : Selling, sequelize } = require("../models");
const {Op, Sequelize} = require("sequelize");
const isNumber = require('is-number');

const ROWS_PER_PAGE = 9;
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

//DELETE /sellings?
const deleteSellingData = (paymentId)=>{
	return Selling.destroy({
		where:{
			paymentId: parseInt(paymentId)
		}
	}).catch(err=>{
		console.log(err);
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
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;//offset 
	let totalRows = 0;
	let totalPage = 0;

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
	}
	if(searchQuery!==""){
		if(isNumber(searchQuery)){
			obj.where={
				[Op.or]:[
					{productPrice:{
						[Op.eq]: parseInt(searchQuery)
					}},{totalPrice:{
						[Op.eq]: parseInt(searchQuery)
					}},{quantity:{
						[Op.eq]: parseInt(searchQuery)
					}}
				]
			}
		}else{
			obj.where={
				[Op.or]:[
					Sequelize.where(Sequelize.fn('lower',Sequelize.col('productName')),{
						[Op.like]: '%'+searchQuery.toLowerCase()+'%'
					})
				]
			}
		}
	}
	Selling.count().then(rowCount=>{
		totalRows = rowCount;
		totalPage = Math.ceil(rowCount / rowsPerPage);

		obj.offset=offset;
		obj.limit=rowsPerPage;
		if(req.query.orderby && req.query.order){
			obj.order=[[req.query.orderby,req.query.order]];
		}
		return Selling.findAll(obj)
	}).then(rows=>{
		res.status(200).send({
			result:rows,
			page: page,
			rowsPerPage: rowsPerPage,
			totalRows:totalRows,
			totalPage: totalPage
		})
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}

const getCustomerSellingData = (req,res)=>{
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;//offset 

	let totalRows = 0;
	let totalPage = 0;

	let rawQuery="";
	const groupby=req.query.groupby;

	if(searchQuery===""){
				rawQuery=`SELECT "UsrPay"."customerId","UsrPay".name,SUM("Sellings".quantity) AS "totBuy",SUM("Sellings"."totalPrice") AS "totPaid"
FROM (SELECT a.id AS "customerId",a.name,b.id AS "paymentId"
FROM t_user AS "a" INNER JOIN "Payments" AS "b"
ON a.id=b."userId") AS "UsrPay" INNER JOIN "Sellings"
ON "UsrPay"."paymentId"="Sellings"."paymentId"
GROUP BY "UsrPay"."customerId","UsrPay".name`;
			}else if(isNumber(searchQuery)){
				rawQuery=`SELECT "UsrPay"."customerId","UsrPay".name,SUM("Sellings".quantity) AS "totBuy",SUM("Sellings"."totalPrice") AS "totPaid"
FROM (SELECT a.id AS "customerId",a.name,b.id AS "paymentId"
FROM t_user AS "a" INNER JOIN "Payments" AS "b"
ON a.id=b."userId") AS "UsrPay" INNER JOIN "Sellings"
ON "UsrPay"."paymentId"="Sellings"."paymentId"
WHERE "totBuy"=${searchQuery} OR "totPaid"=${searchQuery}
GROUP BY "UsrPay"."customerId","UsrPay".name`;
			}else{
				rawQuery=`SELECT "UsrPay"."customerId","UsrPay".name,SUM("Sellings".quantity) AS "totBuy",SUM("Sellings"."totalPrice") AS "totPaid"
FROM (SELECT a.id AS "customerId",a.name,b.id AS "paymentId"
FROM t_user AS "a" INNER JOIN "Payments" AS "b"
ON a.id=b."userId") AS "UsrPay" INNER JOIN "Sellings"
ON "UsrPay"."paymentId"="Sellings"."paymentId"
WHERE LOWER("UsrPay".name) LIKE '%${searchQuery.toLowerCase()}%' 
GROUP BY "UsrPay"."customerId","UsrPay".name`;
			}
			
			sequelize.query(rawQuery).then(([results])=>{
				totalRows = results.length;
				totalPage =  Math.ceil(results.length / rowsPerPage);

				return sequelize.query(rawQuery+` OFFSET ${offset} LIMIT ${rowsPerPage}`);
			}).then(([results])=>{
				res.status(200).send({
					result:results,
					page:page,
					rowsPerPage: rowsPerPage,
					totalRows:totalRows,
					totalPage: totalPage
				});
			}).catch(err=>{
				console.log(err)
				res.status(500).send(err);
			})
}

const getProductSellingData = (req,res)=>{
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;//offset 

	let totalRows = 0;
	let totalPage = 0;

	let rawQuery="";

	const groupby=req.query.groupby;

	if(searchQuery===""){
		rawQuery=`SELECT a."productId",a."productName", SUM(a.quantity) AS "totalProductSold"
FROM "Sellings" AS "a"
GROUP BY a."productId",a."productName"`;
	}else if(isNumber(searchQuery)){

	}else{
		rawQuery=`SELECT a."productId",a."productName", SUM(a.quantity) AS "totalProductSold"
FROM "Sellings" AS "a"
WHERE LOWER(a."productName") LIKE '%${searchQuery.toLowerCase()}%'
GROUP BY a."productId",a."productName"`;
	}
	sequelize.query(rawQuery).then(([results])=>{
		totalRows = results.length;
		totalPage =  Math.ceil(results.length / rowsPerPage);

		return sequelize.query(rawQuery+` OFFSET ${offset} LIMIT ${rowsPerPage}`);
	}).then(([results])=>{
		res.status(200).send({
			result:results,
			page:page,
			rowsPerPage: rowsPerPage,
			totalRows:totalRows,
			totalPage: totalPage
		});
	}).catch(err=>{
		console.log(err)
		res.status(500).send(err);
	})
}

const getSellingData = (req,res)=>{
	const groupby=req.query.groupby || "";
	if(req.query.userid!== undefined){
		getCustomerPurchaseData(req,res);
	}else{
		if(groupby!==""){
			// console.log('grouped by..')
			if(groupby==="product"){
				getProductSellingData(req,res);
			}else if(req.query.groupby==="customer"){
				getCustomerSellingData(req,res);
			}else{
				return res.status(400).send('Invalid query!')
			}
		}else{
			// console.log('fetching whole selling data...');
			getAllSellingData(req,res);
		}
	}
}

module.exports={insertSellingData,getSellingData,deleteSellingData};