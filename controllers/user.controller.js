const db=require("../models");
const { user: User } = db;
//disini, user itu bisa memiliki role customer,admin,atau superadmin.

//GET beberapa data customer
//
const getUsers=(req,res)=>{
	User.findAll({
		attributes:['id','name','userName','password','email','mobile','photo','role'],
		where:{
			role:parseInt(req.query.role)
		}
	}).then(users=>{
		return res.status(200).send(users);
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