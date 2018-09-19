const mongoose = require('mongoose')
const chalk = require('chalk')

// clear up all deprecation warnings
// https://github.com/Automattic/mongoose/issues/6922#issue-354147871
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)

mongoose.connect(`mongodb://${config.dbInfo.usr}:${config.dbInfo.pwd}@${config.dbInfo.url}`)

const db = mongoose.connection
db.once('open', async ()=>
{
    console.log(chalk.green('Database connected!'))
})
db.on('error', async ()=>
{
    console.log(chalk.red('Database connect failure...'))
})

module.exports = db