const model = require(`${config.backendDir}/model`)
const express = require('express')
const request = require('request')
const router = express.Router();


// 設定路由
router.get('/', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.sendFile(`${config.productDir}/page/index/-.html`)
    return 回應.sendFile(`${config.productDir}/page/index-logedin/-.html`)
})
router.get('/setting', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.sendFile(`${config.productDir}/page/index/-.html`)
    回應.sendFile(`${config.productDir}/page/setting/-.html`)
})
router.get('/oauth2', async (請求, 回應)=>
{
    if(請求.未登入)
        return 回應.sendFile(`${config.productDir}/page/index/-.html`)

    const scope = 'profile https://www.googleapis.com/auth/cloudprint https://www.googleapis.com/auth/drive'

    // 已有資料，刷新令牌
    if (請求.使用者.GCP) {
        const 結果 = await new Promise(取得=>{
            request.post({
                url: config.googleAPI.web.token_uri,
                form:
                {
                    grant_type: 'refresh_token',
                    refresh_token: 請求.使用者.GCP.refresh_token,
                    client_id: config.googleAPI.web.client_id,
                    client_secret: config.googleAPI.web.client_secret,
                }}, (錯誤, 回應, 結果)=>{取得(JSON.parse(結果))})
        })
        回應.redirect('https://localhost:3000/setting')
    }
    // 尚無資料，取得令牌
    else {
        if (請求.query.code) {
            const 結果 = await new Promise(取得=>{
                request.post({
                    url: config.googleAPI.web.token_uri,
                    form:
                    {
                        grant_type: 'authorization_code',
                        code: 請求.query.code,
                        client_id: config.googleAPI.web.client_id,
                        client_secret: config.googleAPI.web.client_secret,
                        redirect_uri: config.googleAPI.web.redirect_uris[1],
                    }}, (錯誤, 回應, 結果)=>{取得(JSON.parse(結果))})
            })
            請求.使用者.GCP = 結果
            await 請求.使用者.save()
            回應.redirect('https://localhost:3000/setting')
        }
        else {
            回應.redirect(`${config.googleAPI.web.auth_uri}?response_type=code&client_id=${config.googleAPI.web.client_id}&scope=${scope}&redirect_uri=${config.googleAPI.web.redirect_uris[1]}&approval_prompt=force&access_type=offline`)
        }
    }
})


module.exports = router;
