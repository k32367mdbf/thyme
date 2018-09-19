const model = require(`${config.backendDir}/model`)
const express = require('express')
const crypto = require('crypto')
const request = require('request')
const api = express.Router();


// 設定API
api.post('/login', async (請求, 回應)=>
{
    const 使用者 = await model.使用者.findOne({
        帳號: 請求.body.帳號
    })
    if (!使用者)
        return 回應.json({狀態:'此使用者尚未註冊'})
    
    let 初始向量 = 使用者.IV
    let 解密器 = crypto.createDecipheriv('aes-256-cbc', config.AES.key, 初始向量)
    let 解密結果 = 解密器.update(使用者.密碼, 'hex', 'utf8')
    解密結果 += 解密器.final('utf8')

    if (解密結果 == 請求.body.密碼)
    {
        // 產生Session
        const hasher = crypto.createHash('sha256')
        const hash = hasher.update(`${使用者.帳號}${new Date().getTime()}Cheers to my fucking life!`).digest('hex')
        
        // 存Cookie
        回應.cookie('account', 使用者.帳號, {maxAge: 1000*60*1200, secure: true, httpOnly: true})
        回應.cookie('session', hash, {maxAge: 1000*60*1200, secure: true, httpOnly: true})

        // 存資料庫
        // 使用者.session.push(hash)
        使用者.session = [ hash ]
        await 使用者.update({session: 使用者.session})

        return 回應.json({狀態:'登入成功', 資料: 使用者})
    }
    else
    {
        return 回應.json({狀態:'密碼錯誤'})
    }
})
api.post('/signup', async (請求, 回應)=>
{
    const 使用者 = await model.使用者.findOne({
        帳號: 請求.body.帳號
    })
    if (使用者)
        return 回應.json({狀態:'此使用者已註冊'})

    let 初始向量 = crypto.randomBytes(8).toString('hex')
    let 加密器 = crypto.createCipheriv('aes-256-cbc', config.AES.key, 初始向量)
    let 加密結果 = 加密器.update(請求.body.密碼, 'utf8', 'hex')
    加密結果 += 加密器.final('hex')

    const 註冊者 = await model.使用者.create({
        姓:     請求.body.姓,
        名:     請求.body.名,
        帳號:   請求.body.帳號,
        密碼:   加密結果,
        IV:     初始向量,
        信箱:   請求.body.信箱,
        手機:   請求.body.手機
    })

    // 產生Session
    const hasher = crypto.createHash('sha256')
    const hash = hasher.update(`${註冊者.帳號}${new Date().getTime()}Cheers to my fucking life!`).digest('hex')
    
    // 存Cookie
    回應.cookie('account', 註冊者.帳號, {maxAge: 1000*60*1200, secure: true, httpOnly: true})
    回應.cookie('session', hash, {maxAge: 1000*60*1200, secure: true, httpOnly: true})

    // 存資料庫
    // 使用者.session.push(hash)
    註冊者.session = [ hash ]
    await 註冊者.update({session: 註冊者.session})

    return 回應.json({
        狀態:'註冊成功'
    })
})
api.post('/getInfo', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })
    return 回應.json({
        姓: 請求.使用者.姓,
        名: 請求.使用者.名,
        信箱: 請求.使用者.信箱,
        手機: 請求.使用者.手機,
        店名: 請求.使用者.店名,
        店家ID: 請求.使用者.店家ID,
    })
})
api.post('/getPrinter', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })

    if(請求.使用者.GCP)
    {
        // 刷新令牌
        const access_token = await new Promise(取得=>{
            request.post({
                url: config.googleAPI.web.token_uri,
                form:
                {
                    grant_type: 'refresh_token',
                    refresh_token: 請求.使用者.GCP.refresh_token,
                    client_id: config.googleAPI.web.client_id,
                    client_secret: config.googleAPI.web.client_secret,
                }}, (錯誤, 回應, 結果)=>{取得((JSON.parse(結果)).access_token)})
        })

        const 印表機 = await new Promise(取得=>{
            request.post({
            url: 'https://www.google.com/cloudprint/search',
            headers: {
                'Authorization': `OAuth ${access_token}`,
            }}, (錯誤, 回應, 結果)=>{ 取得((JSON.parse(結果)).printers) })
        })

        // 順便存印表機
        請求.使用者.印表機 = 印表機.filter( (item) => {
            if(item.id == '__google__docs') { return false; } return true;
        }).map( (item) => {
            return {
                name: item.displayName,
                id: item.id
            }
        })
        請求.使用者.save()
    }

    return 回應.json({
        狀態: 請求.使用者.GCP ? '成功' : '尚未取得授權',
        list: 請求.使用者.GCP ? 請求.使用者.印表機 : ''
    })
})
api.post('/getOrder', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })
    
    return 回應.json({
        送出的訂單: 請求.使用者.送出的訂單,
        收到的訂單: 請求.使用者.收到的訂單,
    })
})
api.post('/getOrderInfo', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })
    
    const 訂單 = await model.訂單.findOne({
        單號: 請求.body.單號
    })

    return 回應.json(訂單)
    
})
api.post('/setBasicInfo', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })

    await 請求.使用者.update({
        姓: 請求.body.姓,
        名: 請求.body.名,
        信箱: 請求.body.信箱,
        手機: 請求.body.手機,
    })
    return 回應.json({ 狀態:'保存成功' })
})
api.post('/setBusiInfo', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })

    await 請求.使用者.update({
        店名: 請求.body.店名,
        店家ID: 請求.body.店家ID,
    })
    return 回應.json({ 狀態:'保存成功' })
})
api.post('/getShop', async (請求, 回應)=>
{
    const list = await model.使用者.find({ 店家ID: {$exists: true} }, {
        帳號: true,
        店名: true,
        店家ID: true,
        印表機: true,
        _id: false,
    })
    return 回應.json( list )
})
api.post('/GCP', async (請求, 回應)=>
{
    const 店家 = await model.使用者.findOne({
        帳號: 請求.cookies.dst ? 請求.cookies.dst : 請求.使用者.帳號
    })

    // 刷新令牌
    const access_token = await new Promise(取得=>{
        request.post({
            url: config.googleAPI.web.token_uri,
            form:
            {
                grant_type: 'refresh_token',
                refresh_token: 店家.GCP.refresh_token,
                client_id: config.googleAPI.web.client_id,
                client_secret: config.googleAPI.web.client_secret,
            }}, (錯誤, 回應, 結果)=>{取得((JSON.parse(結果)).access_token)})
    })

    const GCPOrder = request({
        url: 'https://www.google.com/cloudprint/submit',
        headers: {
            'Content-Type': 請求.get('content-type'),
            'Authorization': `OAuth ${access_token}`,
        }})

    請求.pipe(GCPOrder);
    return GCPOrder.pipe(回應);
    
})
api.post('/saveOrder', async (請求, 回應)=>
{
    // 移動 G Drive 檔案
    // ...

    if(請求.未登入 == false)
    {
        請求.使用者.送出的訂單.push(請求.body.單號)
        await 請求.使用者.save()
    }

    await model.訂單.create({
        單號:       請求.body.單號,
        來源帳號:   請求.使用者 ? 請求.使用者.帳號 : undefined,
        信箱:       請求.body.信箱,
        手機:       請求.body.手機,
        目的帳號:   請求.cookies.dst,
        檔案ID:     請求.body.檔案ID,
        印表機:     請求.body.印表機,
    })

    const 店家 = await model.使用者.findOne({
        帳號: 請求.cookies.dst
    })

    店家.收到的訂單.push(請求.body.單號)
    await 店家.save()

    回應.clearCookie('dst')

    return 回應.json({ 狀態:'保存成功', 單號: 請求.body.單號 })
})
api.post('/finishOrder', async (請求, 回應)=>
{
    // 刪除 G Drive 檔案
    // ...

    if(請求.未登入)
        return 回應.json({ 狀態:'未登入' })

    await 請求.使用者.update({
        $pull: { 收到的訂單: 請求.body.單號 }
    })

    const 訂單 = await model.訂單.findOne({
        單號: 請求.body.單號,
    })

    if(訂單.來源帳號){
        const 顧客 = await model.使用者.findOne({
            帳號: 訂單.來源帳號,
        })
        await 顧客.update({
            $pull: { 送出的訂單: 請求.body.單號 }
        })
    }

    訂單.remove()

    return 回應.json({ 狀態:'保存成功' })
})


module.exports = api;
