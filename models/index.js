const configuration = require("../config/db.config.js");
const { Sequelize, DataTypes} = require('sequelize');//untuk ORM
const sequelize = new Sequelize(
    configuration.DB,
    configuration.USER,
    configuration.PASSWORD,
    {
      host: configuration.HOST,
      dialect: configuration.dialect,
      operatorsAliases: false,
  
      pool: {
        max: configuration.pool.max,
        min: configuration.pool.min,
        acquire: configuration.pool.acquire,
        idle: configuration.pool.idle
      }
    }
)

const db = {};

db.DataTypes = DataTypes;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, DataTypes);
db.refreshToken = require("./refreshToken.model.js")(sequelize, DataTypes);
db.product = require("./product.model")(sequelize,DataTypes);
db.cart= require("./cart.model")(sequelize,DataTypes);
db.payment=require("./payment.model")(sequelize,DataTypes);
db.selling=require("./selling.model")(sequelize,DataTypes);
db.log=require("./log.model")(sequelize,DataTypes);

//relasi satu-ke-satu antara tabel 'user' dan 'refreshTokens'
//refreshTokens punya foreign key yang merujuk ke id dari sebuah User
db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});

//relasi satu-ke-satu antara tabel 'user' dan 'refreshTokens'
//buat sebuah foreign key pada tabel 'refreshTokens' yang merujuk ke atribut id pada tabel user
db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId', targetKey: 'id'
});

//satu customer hanya punya satu cart
db.cart.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});

db.user.hasOne(db.cart, {
  foreignKey: 'userId', targetKey: 'id'
})

//user (customer) dan payment berelasi satu ke banyak
db.user.hasMany(db.payment, {
  foreignKey: 'userId', targetKey: 'id'
})

db.payment.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
})

//payment dan product itu berelasi banyak ke banyak (many-to-many)
db.payment.belongsToMany(db.product,{
  through: db.selling,
  foreignKey:'paymentId',
})

db.product.belongsToMany(db.payment,{
  through: db.selling,
  foreignKey:'productId',
})

module.exports = db;