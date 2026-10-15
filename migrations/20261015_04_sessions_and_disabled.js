const { DataTypes, Sequelize } = require('sequelize')
module.exports = {
  up: async ({ context: qi, transaction }) => {
    const columns = await qi.describeTable('users', { transaction })
    if (!columns.disabled) {
      await qi.addColumn('users', 'disabled', {
        type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
      }, { transaction })
    }
    if (!columns.admin) {
      await qi.addColumn('users', 'admin', {
        type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false
      }, { transaction })
    }
    await qi.createTable('sessions', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      token: { type: DataTypes.TEXT, allowNull: false, unique: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { transaction })
  },
  down: async ({ context: qi, transaction }) => {
    await qi.dropTable('sessions', { transaction })
    await qi.removeColumn('users', 'admin', { transaction })
    await qi.removeColumn('users', 'disabled', { transaction })
  }
}
