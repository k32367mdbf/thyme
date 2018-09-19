import component from "/util/component.js"

customElements.define('login-panel', class extends HTMLElement
{
    constructor(){
        super(); ( async ()=>{

        // Create Shadow DOM
        this.attachShadow({mode: 'open'}).appendChild( await component.createComponent(
            '/component/login-panel/-.html',{ cssUrl: 
            '/component/login-panel/-.css' }))

        // 監聽內部事件
        this.shadowRoot.addEventListener('submit', (e)=>{
            e.preventDefault()
            const target = e.path
            if (target[0].id == '登入') {
                this.dispatchEvent(new CustomEvent('登入請求', { bubbles: true, composed: true, detail: {
                    from: this.tagName,
                    data: this.取得目前值('登入')
                }}))
            }
            else if (target[0].id == '註冊') {
                this.dispatchEvent(new CustomEvent('註冊請求', { bubbles: true, composed: true, detail: {
                    from: this.tagName,
                    data: this.取得目前值('註冊')
                }}))
            }
        })

        this.shadowRoot.querySelector('#close').addEventListener('click', (e)=>{
            const 登入 = this.shadowRoot.querySelector('#登入')
            const 註冊 = this.shadowRoot.querySelector('#註冊')
            const close = this.shadowRoot.querySelector('#close')
            註冊.setAttribute('style', 'display: none')
            登入.setAttribute('style', 'display: none')
            close.setAttribute('style', 'display: none')
            this.dispatchEvent(new CustomEvent('關掉面板', { bubbles: true, composed: true }))
        })

    })()}

    static get observedAttributes() {
        return ['set']
    }

    attributeChangedCallback(name, 舊值, 新值) {
        if (name == 'set') {
            console.log(this.getAttribute('set'))
        }
    }

    切換面板(which)
    {
        this.清除目前值()
        const 登入 = this.shadowRoot.querySelector('#登入')
        const 註冊 = this.shadowRoot.querySelector('#註冊')
        const close = this.shadowRoot.querySelector('#close')
        if (which == '登入') {
            close.setAttribute('style', '')
            登入.setAttribute('style', '')
            註冊.setAttribute('style', 'display: none')
        }
        else if (which == '註冊') {
            close.setAttribute('style', '')
            註冊.setAttribute('style', '')
            登入.setAttribute('style', 'display: none')
        }
    }

    取得目前值(選擇)
    {
        let 目前值 = {}
        if(選擇 == '登入')
        {
            目前值 = {
                帳號: this.shadowRoot.querySelector('#登入 [name=帳號]').value,
                密碼: this.shadowRoot.querySelector('#登入 [name=密碼]').value,
                記住我: this.shadowRoot.querySelector('#登入 [name=記住我]').checked,
            }
        }
        if(選擇 == '註冊')
        {
            目前值 = {
                帳號: this.shadowRoot.querySelector('#註冊 [name=帳號]').value,
                信箱: this.shadowRoot.querySelector('#註冊 [name=信箱]').value,
                密碼: this.shadowRoot.querySelector('#註冊 [name=密碼]').value,
            }
        }
        return 目前值
    }

    清除目前值()
    {
        const 登入 = this.shadowRoot.querySelector('#登入')
        const 註冊 = this.shadowRoot.querySelector('#註冊')
        登入.querySelector('[name=帳號]').value = ''
        登入.querySelector('[name=密碼]').value = ''
        // 登入.querySelector('[name=記住我]').checked
        註冊.querySelector('[name=帳號]').value = ''
        註冊.querySelector('[name=信箱]').value = ''
        註冊.querySelector('[name=密碼]').value = ''
        註冊.querySelector('[name=確認密碼]').value = ''
    }

    

})
