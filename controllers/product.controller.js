const db=require("../models");
const path = require('node:path');
const {Op, Sequelize} = require("sequelize");

const { product: Product } = db;
const ROWS_PER_PAGE = 8;

const getAllProduct = (req,res)=>{
	const page = parseInt(req.query.page) || 0;//halaman ke-1 -> page ke-0
	const rowsPerPage = parseInt(req.query.limit) || ROWS_PER_PAGE;//jumlah row pasa setiap halaman
	const searchQuery = req.query["search-query"] || "";//kueri pencarian log
	const offset = page * rowsPerPage;//offset 

	let totalRows = 0;
	let totalPage = 0;

	let whereCondition = {};
	whereCondition ={
		[Op.or]:[
			Sequelize.where(Sequelize.fn('lower',Sequelize.col('name')),{
				[Op.like]: '%'+searchQuery.toLowerCase()+'%'
			})
		]
	}
	Product.count({
		where:whereCondition
	}).then(rowCount=>{
		totalRows = rowCount;
		totalPage =  Math.ceil(rowCount / rowsPerPage);

		return Product.findAll({
			attributes:['id','name','description','price','stock','image','unit','createdAt','updatedAt'],
			where:whereCondition,
			offset:offset,
			limit:rowsPerPage
		})
	}).then(products=>{
		if(products.length===0){
			return res.status(500).send(
				Array({
					msg:"fatal error! no products in DB!",
					param:"other"
				})
			)
		}else{
			return res.status(200).send({
				result:products,
				page: page,
				rowsPerPage: rowsPerPage,
				totalRows:totalRows,
				totalPage: totalPage
			});
		}
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	});	
}

//temporary, khusus buat daftar produk customer
const getProductList = (req,res)=>{
	Product.findAll({
		attributes:['id','name','description','price','stock','image','unit','createdAt','updatedAt'],
	}).then(products=>{
		return res.status(200).send(
			products
		);
	}).catch(err=>{
		console.log(err);
		res.status(500).send(err);
	});	
}

//ini bisa luas makna nya
const getProduct= (req,res)=>{
	db.sequelize.query(`SELECT id,name,description,price,stock,image,unit FROM 'Products' WHERE name LIKE '%${req.body.name}%'`).then(([products, metadata])=>{
		if(products.length>0){
			return res.status(200).send(products);
		}else{
			return res.status(400).send(Array({msg:"product not found!",param:"name"}));
		}
	}).catch(err=>{
		return res.status(500).send(Array({msg:err,param:"db"}))
	})
}

const getProductById=(req,res)=>{
	Product.findOne({
		attributes:['id','name','description','price','stock','image','unit'],
		where:{
			id:parseInt(req.params.productId)
		}
	}).then(product=>{
		if(product){
			return res.status(200).send(product);
		}else{
			return res.status(400).send(Array({msg:"Product not found",param:"productId"}))
		}
	}).catch(error=>{
		return res.sendStatus(500)
		console.log(error)
	})
}

const deleteProduct = (req,res)=>{
	Product.destroy({
		where: {
			id: req.body.id
		}
	}).then(numDeleted=>{
		return res.status(200).send(Array({msg: `Successfuly deleting ${numDeleted} products!`}));
	}).catch(err=>{
		return res.status(500).send(Array({msg:err,param:"other"}));
	})
}

//TODO: harus ditambah validasi
const updateProduct = (req,res)=>{
	let updateList={};
	let notEmpty=false;
	//bisa update salah satu field atau semuanya
	if(req.body.name!== undefined){
		updateList.name=req.body.name;
		notEmpty=true;
	}
	if(req.body.description!== undefined){
		updateList.description=req.body.description;
		notEmpty=true;
	}
	if(req.body.price!== undefined){
		updateList.price=req.body.price;
		notEmpty=true;
	}
	if(req.body.stock!== undefined){
		updateList.stock=req.body.stock;
		notEmpty=true;
	}
	if(req.file!== undefined){
		updateList.image=req.file.path;
		notEmpty=true;
	}
	if(req.body.unit!== undefined){
		updateList.unit=req.body.unit;
		notEmpty=true;
	}

	if(!notEmpty){
		//minimal harus udpate satu field
		return res.status(400).send(Array({msg:'Please provide at least one field!',param:'other'}));
	}
	Product.findOne({
		where:{
			id: parseInt(req.params.productId)
		}
	}).then(product=>{
		product.update(updateList,{
			where:{
				id:req.body.id
			}
		}).then(product=>{
			return res.status(200).send(Array({msg:`Successfuly updating ${res[0]} products!`}));
		})
	}).catch(err=>{
		console.log(err);
		return res.status(500).send(Array({msg:err,param:"db"}))
	})
}

//TODO: harus ditambah validasi
//ini cuma satu produk aja
const addProduct=(req,res)=>{
	//pertama-tama harus cek dulu apakah produk yang ingin dibuat sudah pernah dibuat atau belum
	Product.findOne({
		where:{
			name: req.body.name
		}
	}).then(product=>{
		if(product){
			return res.status(400).send(Array({msg:"This name is already used!",param:'name'}))
		}else{
			return Product.create({
				name: req.body.name,
        		description: req.body.description,
        		price: req.body.price,
        		stock: req.body.stock,
        		image: req.file.path,
        		unit: req.body.unit//ini masih bimbang, mending dipake atau jgn.
			})		
		}
	}).then(product=>{
		//konfirmasi kalau produknya sudah berhasil ditambahin
		return res.status(200).send(Array({msg:"Product successfuly added!"}))
	}).catch(err=>{
		return res.status(500).send(Array({msg:err,param:"db"}))
	})
}

const getProductImage=(req,res)=>{
	const productId = req.params.productId;

    Product.findOne({
        attributes: ['image'],
        where: {
            id: parseInt(productId)
        }
    }).then(product=>{
    	//console.log('IMAGE PATH: '+path.join(__dirname, '..',product.image))
        res.status(200).sendFile(path.join(__dirname, '..',product.image));
    }).catch(err=>{
    	res.status(500).send();
    	console.log(err);
    })
}

//pengennya overloading ke method updateProduct
//tapi ternyata javascript gak support overloading,
//jadi terpaksa buat method baru
const decreaseProductStock=(productId,purchasedQty)=>{
	 Product.findOne({
        attributes: ['id','name','description','price','stock','image','unit'],
        where: {
            id: parseInt(productId)
        }
    }).then(product=>{
    	const previousStock=parseInt(product.stock);
    	return product.update({
    		stock: previousStock-parseInt(purchasedQty)
    	},{
    		where:{
				id:parseInt(productId)
			}
    	})
    }).catch(err=>{
    	console.log(err);
    })
}

const increaseProductStock=(productId,returnedQty)=>{
	Product.findOne({
        attributes: ['id','name','description','price','stock','image','unit'],
        where: {
            id: parseInt(productId)
        }
    }).then(product=>{
    	const previousStock=parseInt(product.stock);
    	return product.update({
    		stock: previousStock + parseInt(returnedQty)
    	},{
    		where:{
				id:parseInt(productId)
			}
    	})
    }).catch(err=>{
    	console.log(err);
    })
}

module.exports={getProductList,decreaseProductStock,increaseProductStock,getProductById,getProductImage,getAllProduct,getProduct,deleteProduct,updateProduct,addProduct};