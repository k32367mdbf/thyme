import component from "/util/component.js"

customElements.define( 'setting-menu', class extends HTMLElement
{
    constructor(){
        super(); ( async ()=>{

        // Create Shadow DOM
        this.attachShadow({mode: 'open'}).appendChild( await component.createComponent(
            '/component/setting-menu/-.html',{ cssUrl: 
            '/component/setting-menu/-.css' }))
        
        // 私有屬性
        this._DOM = {
            基本資訊區塊: this.shadowRoot.querySelector('#基本資訊區塊'),
            我的訂單區塊: this.shadowRoot.querySelector('#我的訂單區塊'),
            店家資訊區塊: this.shadowRoot.querySelector('#店家資訊區塊'),
            店家訂單區塊: this.shadowRoot.querySelector('#店家訂單區塊'),
            印表機區塊: this.shadowRoot.querySelector('#印表機區塊'),
            列印區塊: this.shadowRoot.querySelector('#列印區塊'),
            mask: this.shadowRoot.querySelector('#mask'),
            map: this.shadowRoot.querySelector('#map'),
            infowindow_content: this.shadowRoot.querySelector('#infowindow-content'),
            pac_input: this.shadowRoot.querySelector('#pac-input'),
            place_icon: this.shadowRoot.querySelector('#place-icon'),
            place_name: this.shadowRoot.querySelector('#place-name'),
            place_address: this.shadowRoot.querySelector('#place-address'),
            選定地點: this.shadowRoot.querySelector('#選定地點'),
            訂單號: this.shadowRoot.querySelector('#列印區塊 [name=訂單號]'),
            列印: this.shadowRoot.querySelector('#列印區塊 button'),
        }
        this._data = {
            姓: this.shadowRoot.querySelector('#基本資訊 [name=姓]'),
            名: this.shadowRoot.querySelector('#基本資訊 [name=名]'),
            信箱: this.shadowRoot.querySelector('#基本資訊 [name=信箱]'),
            手機: this.shadowRoot.querySelector('#基本資訊 [name=手機]'),
            店名: this.shadowRoot.querySelector('#店家資訊 [name=店名]'),
            店家ID: this.shadowRoot.querySelector('#店家資訊 [name=店家ID]'),
        }
        this._printer = []
        this._printerData = this.shadowRoot.querySelector('#印表機列表'),
        this._訂單 = []
        this._送出的訂單 = this.shadowRoot.querySelector('#我的訂單列表'),
        this._收到的訂單 = this.shadowRoot.querySelector('#店家訂單列表'),
        this.autocomplete = new google.maps.places.Autocomplete(this._DOM.pac_input)
        this.infowindow = new google.maps.InfoWindow()

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
        this.printer = new Proxy( this._printer, {
            get: (printer, key) => {
                return undefined
            },
            set: (printer, key, value) => {
                // printer.length = 0
                this._printerData.innerHTML = ''
                for (const item of value)
                {
                    // printer.push(item)
                    this._printerData.appendChild( document.createRange().createContextualFragment(`
                        <h3>${item.name}</h3>
                        <button>刪除</button>
                    `))
                }
                return true
            },
        })
        this.訂單 = new Proxy( this._訂單, {
            get: (order, key) => {
                return undefined
            },
            set: (order, key, value) => {
                // order.length = 0
                this[`_${key}`].innerHTML = ''
                for (const item of value)
                {
                    // order.push(item)
                    this[`_${key}`].appendChild( document.createRange().createContextualFragment(`
                        <h3>${item}</h3>
                        <button>刪除</button>
                    `))
                }
                return true
            },
        })


        // 監聽內部事件
        this._data.店家ID.addEventListener('click', (e)=>{
            // e.preventDefault()
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
            const place = this.autocomplete.getPlace()
            this.data.店名 = place.name
            this.data.店家ID = place.place_id
            this._DOM.mask.style.display = 'none'
            this._DOM.map.style.display = 'none'
            // this.infowindow.close()
        })
        this._DOM.列印.addEventListener('click', (e)=>{
            e.preventDefault()
            if(this._DOM.訂單號.disabled) { return; }
            this.dispatchEvent(new CustomEvent('列印', { bubbles: true, composed: true, detail: {
                from: this.tagName,
                data: this._DOM.訂單號.value
            }}))
        })
        this.shadowRoot.addEventListener('submit', async (e)=>{
            e.preventDefault()
            const target = e.path
            if (target[0].id == '基本資訊') {
                this.dispatchEvent(new CustomEvent('更新基本資訊', { bubbles: true, composed: true, detail: {
                    from: this.tagName,
                    data: this.取得目前值('基本資訊')
                }}))
            }
            else if (target[0].id == '店家資訊') {
                this.dispatchEvent(new CustomEvent('更新店家資訊', { bubbles: true, composed: true, detail: {
                    from: this.tagName,
                    data: this.取得目前值('店家資訊')
                }}))
            }
        })

        // Google Map
        this.setupGoogleMap()

    })()}

    
    取得目前值(選擇)
    {
        let 目前值 = {}
        if(選擇 == '基本資訊')
        {
            目前值 = {
                姓: this.data.姓,
                名: this.data.名,
                信箱: this.data.信箱,
                手機: this.data.手機,
            }
        }
        if(選擇 == '店家資訊')
        {
            目前值 = {
                店名: this.data.店名,
                店家ID: this.data.店家ID,
            }
        }
        return 目前值
    }

    切換面板(which)
    {
        if (which == '個人資訊') {
            this._DOM.基本資訊區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.setAttribute('style', 'display: none')
            
            this._DOM.基本資訊區塊.removeAttribute('style')
        }
        else if (which == '我的訂單' || which == '切換成顧客') {
            this._DOM.基本資訊區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.setAttribute('style', 'display: none')
            this._DOM.列印區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.removeAttribute('style')
        }
        else if (which == '店鋪設定') {
            this._DOM.基本資訊區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.setAttribute('style', 'display: none')
            this._DOM.列印區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.removeAttribute('style')
        }
        else if (which == '印表機') {
            this._DOM.基本資訊區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.setAttribute('style', 'display: none')
            this._DOM.列印區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.removeAttribute('style')
        }
        else if (which == '訂單' || which == '切換成店家') {
            this._DOM.基本資訊區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.setAttribute('style', 'display: none')
            this._DOM.列印區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.removeAttribute('style')
        }
        else if (which == '列印頁面') {
            this._DOM.基本資訊區塊.setAttribute('style', 'display: none')
            this._DOM.我的訂單區塊.setAttribute('style', 'display: none')
            this._DOM.店家資訊區塊.setAttribute('style', 'display: none')
            this._DOM.店家訂單區塊.setAttribute('style', 'display: none')
            this._DOM.印表機區塊.setAttribute('style', 'display: none')
            this._DOM.列印區塊.setAttribute('style', 'display: none')
            this._DOM.列印區塊.removeAttribute('style')
        }
    }

    setupGoogleMap()
    {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition( (pos) => {
            var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
            map.setCenter(me)
            myloc.setPosition(me)
        }, function(error) {
            console.log(error)
        })
        const map = new google.maps.Map((this._DOM.map), {
          zoom: 15
        })
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this._DOM.pac_input);

        // Bind the map's bounds (viewport) property to the autocomplete object,
        // so that the autocomplete requests use the current map bounds for the
        // bounds option in the request.
        this.autocomplete.bindTo('bounds', map);

        // Set the data fields to return when the user selects a place.
        this.autocomplete.setFields([
            'address_components',
            'geometry',
            'icon',
            'name',
            'place_id',
            'plus_code',
            'types',
            'url',
            'vicinity',
            'formatted_address',
        ]);

        this.infowindow.setContent(this._DOM.infowindow_content);
        const marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -29)
        });

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

        this.autocomplete.addListener('place_changed', () =>{
            this.infowindow.close();
            marker.setVisible(false);
            const place = this.autocomplete.getPlace();
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert('找不到地址~\n請點擊搜尋結果，勿直接按Enter ^^\"')
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            console.log(place)
            let address = '';
            if (place.address_components) {
                address = place.vicinity || [
                    (place.address_components[3] && place.address_components[3].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[0] && place.address_components[0].short_name || '')
                ].join('');
            }

            this._DOM.infowindow_content.children['place-icon'].src = place.icon;
            this._DOM.infowindow_content.children['place-name'].textContent = place.name;
            this._DOM.infowindow_content.children['place-address'].textContent = address;
            this._DOM.infowindow_content.removeAttribute('style')
            this.infowindow.open(map, marker);
        })

    }

})
