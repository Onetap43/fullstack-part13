const { rollbackMigration } = require('./db')
rollbackMigration().catch(error => { console.error(error); process.exit(1) })
