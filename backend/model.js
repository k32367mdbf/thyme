const config = require(`${process.cwd()}/dev/config`)
const db = require(`${config.backendDir}/connect`)
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    account:        { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    mail:           { type: String },
    phone:          { type: String },
    lastName:       { type: String },
    firstName:      { type: String },
    shopName:       { type: String },
    shopID:         { type: String },
    IV:             { type: String },
    printer:        [],
    sentOrder:      [],
    gottenOrder:    [],
    session:        [],
    GCP:            {},
})

const orderSchema = new mongoose.Schema({
    orderID:        { type: String, required: true },
    srcAccount:     { type: String },
    dstAccount:     { type: String, required: true },
    fileID:         { type: String, required: true },
    printer:        { type: String, required: true },
    mail:           { type: String },
    phone:          { type: String },
    generateTime:   { type: Date, default: Date.now },
    finishTime:     { type: Date, default: Date.now },
})

const model = 
{
    user:   db.model('user',    userSchema),
    order:  db.model('order',   orderSchema),
}

module.exports = model
