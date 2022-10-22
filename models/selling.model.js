module.exports = (sequelize, DataTypes)=>{
	const Selling = sequelize.define('Selling',{
		id : {
    		type: DataTypes.INTEGER,
    		autoIncrement: true,
    		primaryKey: true
  		},
		quantity:{
			type: DataTypes.INTEGER,
			allowNull: false
		},
		productName:{
			type: DataTypes.STRING,
			allowNull: false
		},
		productPrice:{
			type: DataTypes.INTEGER,
			allowNull: false
		},
		totalPrice:{
			type: DataTypes.INTEGER,
			allowNull: false
		}
	})

	return Selling; 
}