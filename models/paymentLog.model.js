module.exports = (sequelize, DataTypes)=>{
	const PaymentLog = sequelize.define('PaymentLog',{
		timestamp:{
			type: DataTypes.BIGINT,
			allowNull: false 
		},
		adminId:{
			type: DataTypes.INTEGER,
			allowNull: false
		},
		adminName:{
			type: DataTypes.STRING,
			allowNull: false
		},
		paymentId:{
			type: DataTypes.INTEGER,
			allowNull: false
		},
		action:{
			type: DataTypes.STRING,
			allowNull: false	
		}
	},{
		timestamps:false
	})

	return PaymentLog;
}