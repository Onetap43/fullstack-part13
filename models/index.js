const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./readingList')
const Session = require('./session')

User.hasMany(Blog, { foreignKey: 'userId' })
Blog.belongsTo(User, { foreignKey: 'userId' })

User.belongsToMany(Blog, {
  through: ReadingList,
  as: 'readings',
  foreignKey: 'userId',
  otherKey: 'blogId'
})
Blog.belongsToMany(User, {
  through: ReadingList,
  as: 'readers',
  foreignKey: 'blogId',
  otherKey: 'userId'
})

User.hasMany(Session, { foreignKey: 'userId' })
Session.belongsTo(User, { foreignKey: 'userId' })

module.exports = { Blog, User, ReadingList, Session }
