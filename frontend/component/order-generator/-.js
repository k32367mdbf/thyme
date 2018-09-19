import component from "/util/component.js"

customElements.define('order-generator', class extends HTMLElement
{
    constructor(){
        super(); ( async ()=>{

        // Create Shadow DOM
        this.attachShadow({mode: 'open'}).appendChild( await component.createComponent(
            '/component/order-generator/-.html',{ cssUrl: 
            '/component/order-generator/-.css' }))

        // 私有屬性
        this._DOM = {
            mask: this.shadowRoot.querySelector('#mask'),
            map: this.shadowRoot.querySelector('#map'),
            選擇影印店: this.shadowRoot.querySelector('#選擇影印店'),
            選定地點: this.shadowRoot.querySelector('#選定地點'),
            order: this.shadowRoot.querySelector('#order'),
            infowindow_content: this.shadowRoot.querySelector('#infowindow-content'),
            shopInfo: this.shadowRoot.querySelector('#shopInfo'),
            fileInfo: this.shadowRoot.querySelector('#fileInfo'),
            submit: this.shadowRoot.querySelector('button[type=submit]'),
            訂單區塊: this.shadowRoot.querySelector('#訂單區塊'),
            newfile: this.shadowRoot.querySelector('#newfile'),
        }
        this._data = {
            GCP: this.shadowRoot.querySelector('#GCP'),
            信箱: this.shadowRoot.querySelector('#GCP [name=信箱]'),
            手機: this.shadowRoot.querySelector('#GCP [name=手機]'),
            印表機: this.shadowRoot.querySelector('#GCP [name=printerid]'),
            標題: this.shadowRoot.querySelector('#GCP [name=title]'),
            contentType: this.shadowRoot.querySelector('#GCP [name=contentType]'),
            檔案: this.shadowRoot.querySelector('#GCP [name=content]'),
            單號: this.shadowRoot.querySelector('#單號'),
        }
        this._訂單 = {}
        this._shopList = []

        // getter/setter
        this.data = new Proxy( this._data, {
            get: (data, key) => {
                if(data[key])
                    return data[key].value
                return undefined
            },
            set: (data, key, value) => {
                if(data[key])
                {
                    data[key].value = value
                    return true
                }
                return false
            },
        })
        this.訂單 = new Proxy( this._訂單, {
            get: (data, key) => {
                if(data[key])
                    return data[key]
                return undefined
            },
            set: (data, key, value) => {
                if(data[key])
                {
                    data[key] = value
                    return true
                }
                return false
            },
        })
        this.shopList = new Proxy( this._shopList, {
            get: (shopList, key) => {
                if(shopList[key])
                    return shopList[key]
                return undefined
            },
            set: (shopList, i, list) => {
                if (i == 'length')
                    return true
                shopList.push(list)
                // add marker
                for (const shop of list) {
                    service.getDetails({
                        placeId: shop.店家ID
                    }, (place, status) =>{
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            var marker = new google.maps.Marker({
                                map: map,
                                position: place.geometry.location,
                                icon: new google.maps.MarkerImage('https://i.imgur.com/emMAjoT.png',
                                    new google.maps.Size(40,40),
                                    new google.maps.Point(0,0),
                                    new google.maps.Point(20,40),
                                ),
                            })
                            google.maps.event.addListener(marker, 'click', function() {
                                infowindowContent.children['place-icon'].src = place.icon
                                infowindowContent.children['place-name'].textContent = shop.店名
                                infowindowContent.children['place-address'].textContent = place.formatted_address
                                infowindowContent.shop = shop
                                infowindowContent.removeAttribute('style')
                                infowindow.open(map, this)
                            })
                        }
                    })
                }
                return true
            },
        })

        // 監聽內部事件
        this._DOM.選擇影印店.addEventListener('click', (e)=>{
            e.preventDefault()
            this._DOM.mask.removeAttribute('style')
            this._DOM.map.style.display = 'block'
        })
        this._DOM.mask.addEventListener('click', (e)=>{
            e.preventDefault()
            this._DOM.mask.style.display = 'none'
            this._DOM.map.style.display = 'none'
        })
        this._DOM.選定地點.addEventListener('click', (e)=>{
            e.preventDefault()
            this._訂單.店家帳號 = e.target.parentNode.shop.帳號
            this._訂單.印表機 = e.target.parentNode.shop.印表機[1].id
            this._data.印表機.value = '__google__docs'
            this._DOM.shopInfo.innerHTML = e.target.parentNode.shop.店名
            this._DOM.mask.style.display = 'none'
            this._DOM.map.style.display = 'none'
            infowindow.close()
        })
        this._data.檔案.addEventListener('change', (e)=>{
            this._DOM.fileInfo.innerHTML = e.target.value.split( '\\' ).pop()
        })
        this.shadowRoot.addEventListener('submit', async (e)=>{
            e.preventDefault()
            this._訂單.信箱 = this._data.信箱.value
            this._訂單.手機 = this._data.手機.value
            this.dispatchEvent(new CustomEvent('提交訂單', { bubbles: true, composed: true, detail: {
                from: this.tagName,
                data: this._data.GCP
            }}))
            this._DOM.訂單區塊.removeAttribute('style')
            this._data.GCP.setAttribute('style', 'display:none;')
        })
        this._DOM.newfile.addEventListener('click', (e)=>{
            location.reload()
        })


        // 設定 Google Map
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition( (pos) => {
            var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
            map.setCenter(me)
            myloc.setPosition(me)
        }, function(error) {
            console.log(error)
        })

        var map = new google.maps.Map( this._DOM.map, {
            zoom: 15
        })
        var service = new google.maps.places.PlacesService(map)
        
        var infowindow = new google.maps.InfoWindow()
        const infowindowContent = this._DOM.infowindow_content
        infowindow.setContent(infowindowContent)
        

        var myloc = new google.maps.Marker({
            map: map,
            clickable: false,
            icon: new google.maps.MarkerImage('https://i.imgur.com/eatFocY.png',
                new google.maps.Size(64,64),
                new google.maps.Point(0,0),
                new google.maps.Point(25,25),
                new google.maps.Size(50,50)
            ),
        })
        this.dispatchEvent(new CustomEvent('GmapSetedUp', { bubbles: true, composed: true }))
        this.GmapSetedUp = true
        
    })()}


    顯示訂單(訂單號)
    {

    }

    取得訂單資訊()
    {
        return {
            店家帳號: this._data.訂單.店家帳號,
            印表機: this._data.訂單.印表機,
            信箱: this._data.訂單.信箱,
            手機: this._data.訂單.手機,
        }
    }

})
