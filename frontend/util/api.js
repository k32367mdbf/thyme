const fetchAPI = ( url, option = {} )=>{
    return fetch(`/api${url}`,
    {
        headers: option.noHeaders ? undefined :
        {
            "Content-Type": option.contentType || 'application/json'
        },
        method: option.method || 'post',
        credentials: 'same-origin',
        body: option.noHeaders ? new FormData(option.body) || undefined : JSON.stringify( option.body || undefined )
    })
    .then(回應=>{return 回應.json()})
    .catch(錯誤=>{console.log(錯誤)})
}

const hash = ( password, option = {} )=>{
    return argon2.hash(
    {
        pass:         password,
        salt:         option.salt || 'saltsaltd', // 鹽值
        // 以下選填
        type:         argon2.ArgonType.Argon2d,   // argon2.ArgonType.Argon2d 或 argon2.ArgonType.Argon2i
        hashLen:      option.hashLen || 24,       // hash長度(轉hex變兩倍)
        time:         1,                          // 迭代次數
        mem:          1024,                       // 使用記憶體(KiB)
        parallelism:  1,                          // desired parallelism (will be computed in parallel only for PNaCl)
        distPath:     '/lib'                      // asm.js 檔所在目錄
    })
    .then(結果=>{return 結果.hashHex})
    .catch(錯誤=>{console.log(錯誤)})
}


const api = {
    取得資訊: ( option )=>{ return fetchAPI('/getInfo', {...option}) },
    取得印表機: ( option )=>{ return fetchAPI('/getPrinter', {...option}) },
    取得訂單: ( option )=>{ return fetchAPI('/getOrder', {...option}) },
    更新基本資訊: ( body, option )=>{ return fetchAPI('/setBasicInfo', {...option, body: body}) },
    更新店家資訊: ( body, option )=>{ return fetchAPI('/setBusiInfo', {...option, body: body}) },
    登入: async ( 資訊 )=>{
        資訊.密碼 = await hash( 資訊.密碼 )
        return await fetchAPI('/login', { body: 資訊 })
    },
    註冊: async ( 資訊 )=>{
        資訊.密碼 = await hash( 資訊.密碼 )
        return await fetchAPI('/signup', { body: { ...資訊, 
            姓: '',
            名: '',
            手機: ''
        }})
    },
    取得店家列表: ( option )=>{ return fetchAPI('/getShop', {...option}) },
    GCP: ( body, option )=>{ return fetchAPI('/GCP', { ...option, body: body, noHeaders: true }) },
    提交訂單: async ( 資訊 )=>{
        const 單號 = await hash( `${資訊.檔案ID}${new Date}}`, { hashLen: 4 } )
        資訊.單號 = 單號.toUpperCase()
        return await fetchAPI('/saveOrder', { body: 資訊 })
    },
    取得訂單詳情: ( body, option )=>{ return fetchAPI('/getOrderInfo', {...option, body: body}) },
    完成訂單: ( body, option )=>{ return fetchAPI('/finishOrder', {...option, body: body}) },
}

export default api