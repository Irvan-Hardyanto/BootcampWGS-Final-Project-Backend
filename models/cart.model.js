module.exports = (sequelize, DataTypes)=>{
	const Cart = sequelize.define('Cart',{
		items:{
			type: DataTypes.JSON,
			allowNull: false
		}
	})

	return Cart;
}