const db=require("../models");
const {Op, Sequelize} = require("sequelize");
const isNumber = require('is-number');
const { parseAsync } = require('json2csv');
const _ = require("lodash");
const fs= require('fs');

const { log: Log } = db;
const ROWS_PER_PAGE = 8;
const LOG_FILE_NAME= 'http-log.csv';

//dikutip dari laman: https://mfikri.com/artikel/react-express-mysql-pagination 
//coded by: M FIKRI SETIADI
//quoted by: Irvan H
const getAllLogs=(req,res)=>{
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;//offset 

	const minTimestamp = req.query.min_timestamp || "";
	const maxTimestamp = req.query.max_timestamp || "";

	let totalRows = 0;
	let totalPage = 0;

	let whereCondition = {};
	if(isNumber(searchQuery)){
		whereCondition = {
			[Op.or]:[
				{statusCode:{
					[Op.eq]: parseInt(searchQuery)
				}}
			]
		}
	}else{
		whereCondition = {
			[Op.or]:[
				Sequelize.where(Sequelize.fn('lower',Sequelize.col('method')),{
					[Op.like]: searchQuery.toLowerCase()+'%'
				}),
				Sequelize.where(Sequelize.fn('lower',Sequelize.col('url')),{
					[Op.like]: '%'+searchQuery+'%'
				}),
			]
		};
	}

	//const totalPage =  Math.ceil(totalRows / rowsPerPage);
	Log.count({
		where:whereCondition
	}).then(rowsCount=>{
		totalRows = rowsCount;
		
		totalPage =  Math.ceil(rowsCount / rowsPerPage);
		return Log.findAll({
			attributes:['logId','userId','timestamp','role','sourceIP','method','url','statusCode','responseTime','totalTime'],
			where:whereCondition,
			offset: offset,
			limit: rowsPerPage,
			order:[['timestamp','DESC']],
		})
	}).then(rows=>{
		res.status(200).send({
			result:rows,
			page: page,
			rowsPerPage: rowsPerPage,
			totalRows:totalRows,
			totalPage: totalPage
		});
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	})
}

//dikutip dari: https://dev.to/davidokonji/generating-and-downloading-csv-files-using-express-js-1o4i
//coded by: David Okonji
//kalau lognya udah jutaan baris, perhatikan method ini
//karena bisa saja method ini ngebaca filenya dengan cara langsung dikopi semua ke RAM -> ada kemungkinan RAM nya gk cukup
//dan bisa menyebabkan server crash.
const downloadLog = (req,res)=>{
	const fields= ['logId','userId','timestamp','role','sourceIP','method','url','statusCode','responseTime','totalTime'];
	Log.findAll({
		attributes:fields
	}).then(logs=>{		
		const opts={fields};
		return parseAsync(logs,opts);
	}).then(file=>{
		res.header('Content-Type', 'text/csv');
		res.attachment(LOG_FILE_NAME);
		return res.status(200).send(file);
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(err);
	})
}

module.exports={getAllLogs,downloadLog}