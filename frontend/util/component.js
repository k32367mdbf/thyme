const basic = {

    requestFile: ( file )=>{
        return fetch( file , {
            headers:
            {
                "Content-Type": "text/plain"
            },
            method: 'get',
        })
        .then( 回應 => { return 回應.text() } )
        .catch( 錯誤 => { console.log(錯誤) } )
    },

    createNode: ( string )=>{
        return document.createRange().createContextualFragment( string )
    }
}

const advanse = {
    createComponent: async ( htmlUrl, option = {} )=>{
        const template = basic.createNode( await basic.requestFile(htmlUrl) )
        if( option.cssUrl )
        {
            const style = basic.createNode(`<style>${await basic.requestFile( option.cssUrl )}</style>`)
            template.appendChild(style)
        }
        return template.cloneNode(true)
    }
}


export default { ...basic, ...advanse }