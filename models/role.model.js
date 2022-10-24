module.exports = (sequelize, DataTypes)=>{
	const Role = sequelize.define('Role',{
		roleId:{
			type: DataTypes.INTEGER,
    		autoIncrement: true,
    		primaryKey: true
		},
		name:{
			type: DataTypes.STRING,
			allowNull: false
		}
	})

	return Role;
}