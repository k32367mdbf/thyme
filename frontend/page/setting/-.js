// import store from "/module/store.js"
import api from "/util/api.js"

// 初始化
;(async()=>
{
    // 取得DOM
    const DOM = {
        setting_menu: document.querySelector('setting-menu'),
    }

    // 取得資料
    const store = {
        資訊: await api.取得資訊(),
        印表機: await api.取得印表機(),
        訂單: await api.取得訂單(),
    }

    // 資料綁定
    Object.assign( DOM.setting_menu.data, store.資訊 )
    DOM.setting_menu.printer.list = store.印表機.list
    DOM.setting_menu.訂單.送出的訂單 = store.訂單.送出的訂單
    DOM.setting_menu.訂單.收到的訂單 = store.訂單.收到的訂單


    // 監聽元件事件
    document.addEventListener('導覽列點擊', (e)=>{
        DOM.setting_menu.切換面板(e.detail.id)
    })
    document.addEventListener('更新基本資訊', async (e)=>{
        await api.更新基本資訊(e.detail.data)
        location.reload()
    })
    document.addEventListener('更新店家資訊', async (e)=>{
        await api.更新店家資訊(e.detail.data)
        location.reload()
    })
    document.addEventListener('列印', async (e)=>{
        const order = await api.取得訂單詳情({
            單號: e.detail.data
        })
        DOM.setting_menu._DOM.訂單號.value = ''
        DOM.setting_menu._DOM.訂單號.disabled = true
        DOM.setting_menu._DOM.訂單號.placeholder = '訂單處理中...'
        var form = document.createElement("form")
        form.appendChild( document.createRange().createContextualFragment(`
            <input name='title' value='${order.單號}'>
            <input name='printerid' value='${order.印表機}'>
            <input name='content' value='https://drive.google.com/uc?id=${order.檔案ID}&export=download'>
            <input name="contentType" value='url'>
        `))
        const GCP = await api.GCP(form)
        if (GCP.success) {
            DOM.setting_menu._DOM.訂單號.placeholder = '列印成功'
            DOM.setting_menu._DOM.訂單號.disabled = false
            setTimeout(()=>{
                DOM.setting_menu._DOM.訂單號.placeholder = ''
            },3000)
            await api.完成訂單({
                單號: order.單號,
            })
            const 刷新訂單 = await api.取得訂單()
            DOM.setting_menu.訂單.送出的訂單 = 刷新訂單.送出的訂單
            DOM.setting_menu.訂單.收到的訂單 = 刷新訂單.收到的訂單
        }
    })

    
})()