const db=require("../models");
const { cart: Cart, product: Product } = db;

const createCart = (req,res)=>{
	//cek dulu apakah cart untuk user ini udah ada atau belum
	Cart.findOne({
		where:{
			userId: req.body.userId
		}
	}).then(cart=>{
		//jika cart untuk user ini sudah pernah dibuat sebelumnya...
		if(cart){
			return res.status(400).send(Array({msg:"Cart for this user is already created!",param:"db"}));
		}else{
			return Cart.create({
				items: '',
				userId: req.body.userId
			})
		}
	}).then(items=>{
		return res.sendStatus(200);
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(Array({msg:err,param:"db"}))
	})
}

const getCart = (req,res)=>{
	let promise=null;
	if(req.query.userId){
		promise=Cart.findOne({
			attributes:['id','userId','items','createdAt','updatedAt'],
			where:{
				userId: req.query.userId
			}
		})	
	}else if(req.query.cartId){
		promise=Cart.findOne({
			attributes:['id','userId','items','createdAt','updatedAt'],
			where:{
				id: req.query.cartId
			}
		})	
	}else{
		promise=Cart.findOne({
			attributes:['id','userId','items','createdAt','updatedAt']
		})
	}
	promise.then(cart=>{
		return res.status(200).send(cart);
	}).catch(err=>{
		return res.status(500).send(Array({msg:err,param:"db"}));
	})
}

//tambah / ubah barang belanjaan yang ada di dalam keranjang
//referensi: https://stackoverflow.com/questions/70412781/sequelize-update-not-using-the-correct-where-and-updates-all-rows
const updateCart=(req,res)=>{
	//select cart for a specific user id
	Cart.findOne({
		attributes:['id','items','createdAt','updatedAt','userId'],
		where:{
			userId: parseInt(req.params.userId)
		}
	}).then(cart=>{
		// console.log('cart is: '+ !cart);
		if(!cart){
			//alternatif: route ke halaman khusus keranjang tidak ditemukan dengan status 400


			return res.status(400).send(Array({msg:"FATAL ERROR: Cart for this user is not found!",param:'userId'}))
		}else{
			return cart.update({
				items:JSON.stringify(req.body.items),	
			})
		}
	}).then(succ=>{
		// return res.status(400).send(Array({msg:"Cart Successfuly Updated"}))
	})
	.catch(err=>{
		console.log(err)
		return res.status(400).send(Array({msg:err,param:'db'}))
	})
	
}

module.exports={getCart,createCart,updateCart}