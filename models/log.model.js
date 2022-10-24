module.exports = (sequelize, DataTypes)=>{
	const Log = sequelize.define('Log',{
		logId : {
    		type: DataTypes.INTEGER,
    		autoIncrement: true,
    		primaryKey: true
  		},
  		userId : {
    		type: DataTypes.INTEGER,
    		allowNull: true
  		},
		timestamp:{
			type: DataTypes.DATE,
			allowNull: false,
		},
		role:{
			type: DataTypes.INTEGER,
			allowNull: true
		},
		sourceIP:{
			type: DataTypes.STRING,
			allowNull: false
		},
		method:{
			type: DataTypes.STRING,
			allowNull: false
		},
		url:{
			type: DataTypes.STRING,
			allowNull: false
		},
		statusCode:{
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		responseTime:{
			type: DataTypes.FLOAT,
			allowNull: false
		},
		totalTime:{
			type: DataTypes.FLOAT,
			allowNull: false
		}
	},{
		timestamps: false,
	})

	return Log;
}