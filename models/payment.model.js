module.exports = (sequelize, DataTypes)=>{
	//kalau nanti aplikasi nya bisa nerima lebih dari satu metode pembayaran
	//ada field 'paymentMethod'
	const Payment= sequelize.define('Payment',{
		items:{
			type:DataTypes.JSON,
			allowNull: false
		},
		nominal:{
			type: DataTypes.INTEGER,
			allowNull: false
		},
		paid:{
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		paymentConfirmation:{
            type: DataTypes.STRING,
            allowNull: false
        }
	})

	return Payment;
}