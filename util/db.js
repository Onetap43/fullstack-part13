const { Sequelize } = require('sequelize')

const {
  DATABASE_URL,
  TEST_DATABASE_URL
} = require('./config')

const databaseUrl =
  process.env.TESTING === 'true'
    ? TEST_DATABASE_URL
    : DATABASE_URL

const sequelize = new Sequelize(databaseUrl, {
  logging: console.log
})

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('connected to the database')
  } catch (error) {
    console.error('failed to connect to the database')
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = {
  sequelize,
  connectToDatabase
}