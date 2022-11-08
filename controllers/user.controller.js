const db=require("../models");
const {Op, Sequelize} = require("sequelize");
const { user: User } = db;
//disini, user itu bisa memiliki role customer,admin,atau superadmin.
const ROWS_PER_PAGE = 8;
//GET beberapa data customer
//
const getUsers=(req,res)=>{
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;//offset 

	let totalRows = 0;
	let totalPage = 0;

	let whereCondition = {};
	whereCondition={
		role:parseInt(req.query.role),
		[Op.or]:[
			Sequelize.where(Sequelize.fn('lower',Sequelize.col('name')),{
				[Op.like]: '%'+searchQuery.toLowerCase()+'%'
			}),
			Sequelize.where(Sequelize.fn('lower',Sequelize.col('userName')),{
				[Op.like]: '%'+searchQuery.toLowerCase()+'%'
			}),
		]
	}
	User.count({
		where:whereCondition
	}).then(rowCount=>{
		totalRows = rowCount;
		totalPage =  Math.ceil(rowCount / rowsPerPage);

		return User.findAll({
			attributes:['id','name','userName','password','email','mobile','photo','role'],
			where:whereCondition,
			offset:offset,
			limit:rowsPerPage
		})
	}).then(users=>{
		return res.status(200).send({
			result:users,
			page: page,
			rowsPerPage: rowsPerPage,
			totalRows:totalRows,
			totalPage: totalPage
		});
	}).catch(err=>{
		return res.stats(500).send();
	})
}

const modifyUserRole=(req,res)=>{
	User.findOne({
		attributes:['id','name','userName','password','email','mobile','photo','role'],
		where:{
			id:req.query.userid
		}
	}).then(user=>{
		user.update({
			role: parseInt(req.query.role)
		}).then(succ=>{
			return res.status(200).send();
		})
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(err);
	})
}

const deleteUser=(req,res)=>{
	User.destroy({
		where:{
			id:parseInt(req.params.id)
		}
	}).then(s=>{
		return res.status(200).send();
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(err);
	})
}
module.exports={getUsers,modifyUserRole,deleteUser}