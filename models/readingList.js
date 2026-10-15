const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../util/db')

class ReadingList extends Model {}

ReadingList.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  blogId: { type: DataTypes.INTEGER, allowNull: false },
  read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'readingList',
  tableName: 'reading_lists',
  indexes: [{ unique: true, fields: ['user_id', 'blog_id'] }]
})

module.exports = ReadingList
