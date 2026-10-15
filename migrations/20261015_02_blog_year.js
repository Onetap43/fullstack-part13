const { DataTypes } = require('sequelize')
module.exports = {
  up: async ({ context: qi, transaction }) => {
    const columns = await qi.describeTable('blogs', { transaction })
    if (!columns.year) {
      await qi.addColumn('blogs', 'year', { type: DataTypes.INTEGER, allowNull: true }, { transaction })
    }
  },
  down: async ({ context: qi, transaction }) => {
    await qi.removeColumn('blogs', 'year', { transaction })
  }
}
