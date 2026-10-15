const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'username must not be empty'
        },
        isEmail: {
          msg: 'username must be a valid email address'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'name must not be empty'
        }
      }
    }
  },
  {
    sequelize,
    underscored: true,
    modelName: 'user'
  }
)

module.exports = User