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

module.exports = db;