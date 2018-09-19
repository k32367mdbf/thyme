import component from "/util/component.js"

customElements.define('header-x', class extends HTMLElement
{
    constructor(){
        super(); ( async ()=>{

        // Create Shadow DOM
        this.attachShadow({mode: 'open'}).appendChild( await component.createComponent(
            '/component/header-x/-.html',{ cssUrl: 
            '/component/header-x/-.css' }))

        // 私有屬性
        this._DOM = {
            登入: this.shadowRoot.querySelector('#登入'),
            註冊: this.shadowRoot.querySelector('#註冊'),
            個人檔案: this.shadowRoot.querySelector('#個人檔案'),
            切換成店家: this.shadowRoot.querySelector('#切換成店家'),
            切換成顧客: this.shadowRoot.querySelector('#切換成顧客'),
            個人資訊: this.shadowRoot.querySelector('#個人資訊'),
            我的訂單: this.shadowRoot.querySelector('#我的訂單'),
            店鋪設定: this.shadowRoot.querySelector('#店鋪設定'),
            印表機: this.shadowRoot.querySelector('#印表機'),
            訂單: this.shadowRoot.querySelector('#訂單'),
            列印頁面: this.shadowRoot.querySelector('#列印頁面'),
        }
        
        // 初始化設定
        if(狀態.登入)
        {
            if(頁面 == '設定')
            {
                this._DOM.切換成店家.removeAttribute('style')
                this._DOM.個人資訊.removeAttribute('style')
                this._DOM.我的訂單.removeAttribute('style')
            }
            else
            {
                this._DOM.個人檔案.removeAttribute('style')
            }
        }
        else
        {
            this.shadowRoot.querySelector('#登入').removeAttribute('style')
            this.shadowRoot.querySelector('#註冊').removeAttribute('style')
        }

        // 監聽內部事件
        this.shadowRoot.addEventListener('click',(e)=>{
            const target = e.path
            if (target[0].id == '切換成店家')
            {
                this._DOM.切換成店家.setAttribute('style', 'display: none;')
                this._DOM.個人資訊.setAttribute('style', 'display: none;')
                this._DOM.我的訂單.setAttribute('style', 'display: none;')
                this._DOM.切換成顧客.removeAttribute('style')
                this._DOM.列印頁面.removeAttribute('style')
                this._DOM.訂單.removeAttribute('style')
                this._DOM.印表機.removeAttribute('style')
                this._DOM.店鋪設定.removeAttribute('style')
            }
            else if (target[0].id == '切換成顧客')
            {
                this._DOM.切換成顧客.setAttribute('style', 'display: none;')
                this._DOM.店鋪設定.setAttribute('style', 'display: none;')
                this._DOM.印表機.setAttribute('style', 'display: none;')
                this._DOM.訂單.setAttribute('style', 'display: none;')
                this._DOM.列印頁面.setAttribute('style', 'display: none;')
                this._DOM.切換成店家.removeAttribute('style')
                this._DOM.我的訂單.removeAttribute('style')
                this._DOM.個人資訊.removeAttribute('style')
            }
            this.dispatchEvent(new CustomEvent('導覽列點擊', { bubbles: true, composed: true, detail: {
                from: this.tagName,
                id: target[0].id,
            }}))
        })

    })()}

})
