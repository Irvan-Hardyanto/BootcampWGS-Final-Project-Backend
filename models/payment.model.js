module.exports = (sequelize, DataTypes)=>{
	const Payment= sequelize.define('Payment',{
		nominal:{
			type: DataTypes.INTEGER,
			allowNull: false
		}
	},{
		timestamps: true,
  		updatedAt: false,
	})

	return Payment;
}