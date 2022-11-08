const db=require("../models");
const { paymentLog: PaymentLog } = db;

const getPaymentLogs=(req,res)=>{
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || 7;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;

	let totalRows = 0;
	let totalPage = 0;

	let whereCondition = {};
	PaymentLog.count({
		where:whereCondition
	}).then(rowCount=>{
		totalRows = rowCount;
		totalPage =  Math.ceil(rowCount / rowsPerPage);

		return PaymentLog.findAll({
			where:whereCondition,
			attributes:['id','timestamp','adminId','adminName','paymentId','action'],
			offset: offset,
			limit:rowsPerPage,
		})
	}).then(logs=>{
		return res.status(200).json({
			result:logs,
			page: page,
			rowsPerPage: rowsPerPage,
			totalRows:totalRows,
			totalPage: totalPage
		});
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	});	
}

//POST /payment-logs
const insertPaymentLog=(req,res)=>{
	const timestamp=req.body.timestamp || 0;
	const adminId=req.body.adminId;
	const adminName=req.body.adminName;
	const paymentId=req.body.paymentId;
	const action = req.body.action;

	PaymentLog.create({
		timestamp,
		adminId,
		adminName,
		paymentId,
		action
	}).then(log=>{
		return res.status(200).send();
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(err);
	})
}

module.exports={getPaymentLogs,insertPaymentLog}