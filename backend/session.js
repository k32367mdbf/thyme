const model = require(`${config.backendDir}/model`)


async function session(請求, 回應, next)
{
    請求.未登入 = true

    // 有cookie資訊
    if(請求.cookies.session && 請求.cookies.account)
    {
        // 取得用戶資料
        const 使用者 = await model.使用者.findOne({
            帳號: 請求.cookies.account
        })
        // 有合法session
        if(使用者)
        if(使用者.session)
        if(使用者.session.some((session)=>{return session == 請求.cookies.session}))
        {
            請求.未登入 = false
            請求.使用者 = 使用者
        }
    }
    next()
}

module.exports = session