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

module.exports = db;