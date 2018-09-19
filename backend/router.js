const router = require('express').Router()

router.get('/', async (req, res) =>
{
    return res.sendFile(`${config.productDir}/page/index.html`)
})

module.exports = router