import api from "/util/api.js"

// 初始化
;(async()=>
{
    // 取得DOM
    const DOM = {
        login_button: document.querySelector('header-x'),
        login_panel: document.querySelector('login-panel'),
        order_generator: document.querySelector('order-generator'),
    }

    // 取得資料
    const store = {
        店家列表: await api.取得店家列表(),
    }

    // 資料綁定
    if(DOM.order_generator.GmapSetedUp)
        DOM.order_generator.shopList.push( store.店家列表 )
    

    // 監聽元件事件
    document.addEventListener('GmapSetedUp', async (e)=>{
        DOM.order_generator.shopList.push( store.店家列表 )
    })
    document.addEventListener('提交訂單', async (e)=>{
        document.cookie = `dst=${DOM.order_generator.訂單.店家帳號}`
        const GCP = await api.GCP(e.detail.data)
        if (GCP.success) {
            const 檔案ID = GCP.job.driveUrl.split('\/').reverse()[1]
            const 結果 = await api.提交訂單({
                信箱: DOM.order_generator.訂單.信箱,
                手機: DOM.order_generator.訂單.手機,
                檔案ID: 檔案ID,
                印表機: DOM.order_generator.訂單.印表機
            })
            DOM.order_generator.data.單號 = 結果.單號
        }
    })
    document.addEventListener('導覽列點擊', (e)=>{
        DOM.order_generator.setAttribute('style', 'display:none;')
        DOM.login_panel.切換面板(e.detail.id)
    })
    document.addEventListener('關掉面板', (e)=>{
        DOM.order_generator.removeAttribute('style')
    })
    document.addEventListener('登入請求', async (e)=>{
        await api.登入(e.detail.data)
        location.reload()
    })
    document.addEventListener('註冊請求', async (e)=>{
        await api.註冊(e.detail.data)
        location.reload()
    })

})()