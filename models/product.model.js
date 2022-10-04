
module.exports = (sequelize, DataTypes)=>{
    const Product= sequelize.define('Product',{
        name:{
            type: DataTypes.STRING,
        },
        description:{
            type: DataTypes.STRING,
        },
        price:{
            type: DataTypes.INTEGER,
        },
        stock:{
            type: DataTypes.INTEGER,
        },
        image:{
            type: DataTypes.STRING,
        },
        unit:{
            type: DataTypes.STRING,
        }
    })

    return Product;
}