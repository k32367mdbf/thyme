import component from "/util/component.js"

customElements.define('bkg-paper-anima', class extends HTMLElement
{
    constructor(){
        super(); ( async ()=>{

        // Create Shadow DOM
        this.attachShadow({mode: 'open'}).appendChild( await component.createComponent(
            '/component/bkg-paper-anima/-.html',{ cssUrl: 
            '/component/bkg-paper-anima/-.css' }))
        
    })()}
})
