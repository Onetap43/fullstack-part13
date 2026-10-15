const fs = require('node:fs')
const path = require('node:path')
const { Sequelize, DataTypes, QueryTypes } = require('sequelize')
const { DATABASE_URL, TEST_DATABASE_URL } = require('./config')

const testing = process.env.TESTING === 'true'
const databaseUrl = testing ? TEST_DATABASE_URL : DATABASE_URL
if (testing && DATABASE_URL && TEST_DATABASE_URL) {
  const main = new URL(DATABASE_URL)
  const test = new URL(TEST_DATABASE_URL)
  // Do not allow POST /api/reset to erase the main database by mistake.
  if (main.hostname === test.hostname &&
      (main.port || '5432') === (test.port || '5432') &&
      main.pathname === test.pathname) {
    throw new Error('TEST_DATABASE_URL points to the same database as DATABASE_URL')
  }
}
if (!databaseUrl) {
  throw new Error(`Missing ${testing ? 'TEST_DATABASE_URL' : 'DATABASE_URL'} in environment`)
}
const sequelize = new Sequelize(databaseUrl, { logging: false })
const migrationDir = path.join(__dirname, '..', 'migrations')

const migrate = async (direction = 'up') => {
  const qi = sequelize.getQueryInterface()
  await sequelize.query(`CREATE TABLE IF NOT EXISTS "migrations" ("name" VARCHAR(255) PRIMARY KEY)`)
  const appliedRows = await sequelize.query('SELECT name FROM "migrations"', {
    type: QueryTypes.SELECT
  })
  const applied = new Set(appliedRows.map(row => row.name))
  const files = fs.readdirSync(migrationDir).filter(name => name.endsWith('.js')).sort()
  const todo = direction === 'up'
    ? files.filter(name => !applied.has(name))
    : files.filter(name => applied.has(name)).slice(-1)

  for (const filename of todo) {
    const migration = require(path.join(migrationDir, filename))
    await sequelize.transaction(async transaction => {
      await migration[direction]({ context: qi, transaction })
      if (direction === 'up') {
        await sequelize.query('INSERT INTO "migrations" ("name") VALUES (:name)', {
          replacements: { name: filename }, transaction
        })
      } else {
        await sequelize.query('DELETE FROM "migrations" WHERE "name" = :name', {
          replacements: { name: filename }, transaction
        })
      }
    })
    console.log(`${direction === 'up' ? 'Applied' : 'Rolled back'} migration: ${filename}`)
  }
  console.log('Migrations up to date')
}

const connectToDatabase = async () => {
  await sequelize.authenticate()
  await migrate()
  console.log('connected to the database')
}

const rollbackMigration = async () => {
  await sequelize.authenticate()
  await migrate('down')
  await sequelize.close()
}

module.exports = { sequelize, connectToDatabase, rollbackMigration }
