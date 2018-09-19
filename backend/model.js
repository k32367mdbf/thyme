const config = require(`${process.cwd()}/dev/config`)
const mongoose = require('mongoose')
const db = require(`${config.backendDir}/connect`)


const 使用者Schema = new mongoose.Schema({
    帳號:               { type: String, required: true, unique: true },
    密碼:               { type: String, required: true },
    信箱:               { type: String, required: true, unique: true },
    手機:               { type: String },
    姓:                 { type: String },
    名:                 { type: String },
    店名:               { type: String },
    店家ID:             { type: String },
    IV:                 { type: String },
    印表機: [],
    送出的訂單: [],
    收到的訂單: [],
    session: [],
    GCP: {},
})


const 訂單Schema = new mongoose.Schema({
    單號:               { type: String, required: true },
    來源帳號:           { type: String },
    信箱:               { type: String },
    手機:               { type: String },
    目的帳號:           { type: String, required: true },
    檔案ID:             { type: String, required: true },
    印表機:             { type: String, required: true },
    下單時間:           { type: Date, default: Date.now },
    完成時間:           { type: Date, default: Date.now },
})


const model = 
{
    使用者: db.model('使用者', 使用者Schema),
    訂單: db.model('訂單', 訂單Schema),
}

module.exports = model
