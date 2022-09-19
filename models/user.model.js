
//model dari tabel t_user
//Tabel tersebut merepresentasikan seluruh pengguna baik itu customer, admin, maupun superadmin
module.exports=(sequelize,DataTypes)=>{
    const User = sequelize.define("t_user",{
          id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
          name:{
            type: DataTypes.TEXT,
            allowNull: false
          },
          userName:{
            type: DataTypes.TEXT,
            allowNull: false,
          },
          password:{
            type: DataTypes.TEXT,
            allowNull: false,
          },
          email:{
            type: DataTypes.TEXT,
          },
          mobile:{
            type: DataTypes.TEXT,
          },
          photo:{
            type: DataTypes.TEXT,
          },
          role:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
          }
    },{
        sequelize,
        tableName:'t_user',
        timestamps: false,
      });
    return User;
}