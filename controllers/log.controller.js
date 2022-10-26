const db=require("../models");
const { log: Log } = db;

const getAllLogs=(req,res)=>{
	Log.findAll({
		attributes:['logId','userId','timestamp','role','sourceIP','method','url','statusCode','responseTime','totalTime'],
		order:[['timestamp','DESC']]
	}).then(rows=>{
		res.status(200).send(rows);
	}).catch(err=>{
		console.log(err);
		res.stattus(500).send(err);
	})
}

module.exports={getAllLogs}