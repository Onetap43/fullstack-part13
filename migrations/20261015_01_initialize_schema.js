const { DataTypes, Sequelize } = require('sequelize')

module.exports = {
  up: async ({ context: qi, transaction }) => {
    // Handles both a new database and an existing Chapter 3 database.
    const tables = (await qi.showAllTables({ transaction })).map(table =>
      typeof table === 'string' ? table : (table.tableName || table.table_name || table.name)
    )
    const timestamp = {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }

    if (!tables.includes('users')) {
      await qi.createTable('users', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        name: { type: DataTypes.STRING, allowNull: false },
        created_at: timestamp,
        updated_at: timestamp
      }, { transaction })
    } else {
      const columns = await qi.describeTable('users', { transaction })
      if (!columns.created_at) await qi.addColumn('users', 'created_at', timestamp, { transaction })
      if (!columns.updated_at) await qi.addColumn('users', 'updated_at', timestamp, { transaction })
    }

    if (!tables.includes('blogs')) {
      await qi.createTable('blogs', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        author: { type: DataTypes.TEXT },
        url: { type: DataTypes.TEXT, allowNull: false },
        title: { type: DataTypes.TEXT, allowNull: false },
        likes: { type: DataTypes.INTEGER, defaultValue: 0 },
        user_id: {
          type: DataTypes.INTEGER,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE', onDelete: 'SET NULL'
        },
        created_at: timestamp,
        updated_at: timestamp
      }, { transaction })
    } else {
      const columns = await qi.describeTable('blogs', { transaction })
      if (!columns.created_at) await qi.addColumn('blogs', 'created_at', timestamp, { transaction })
      if (!columns.updated_at) await qi.addColumn('blogs', 'updated_at', timestamp, { transaction })
    }
  },
  down: async ({ context: qi, transaction }) => {
    // Destructive by design; only roll back on disposable/backup databases.
    await qi.dropTable('blogs', { transaction })
    await qi.dropTable('users', { transaction })
  }
}
