const mongoose = require('mongoose')

// clear up all deprecation warnings
// https://github.com/Automattic/mongoose/issues/6922#issue-354147871
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)

mongoose.connect(`mongodb://${config.dbInfo.usr}:${config.dbInfo.pwd}@${config.dbInfo.url}`)


const 資料庫 = mongoose.connection
資料庫.once('open', async ()=>
{
    console.log('資料庫連接成功！')
})
資料庫.on('error', async ()=>
{
    console.log('資料庫連接失敗...')
})


module.exports = 資料庫