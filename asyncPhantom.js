var phantom = require('phantom')
var cheerio = require('cheerio')
var moment = require('moment')
var main = async () => {
    let instance = await phantom.create()
    let page = await instance.createPage()
    await page.on("onResourceRequested", function (requestData) {
        //console.info('Requesting', requestData.url)
    })

    let status = await page.open('http://live.500.com/zqdc.php');
    console.log(status)

    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    //await page.property('viewportSize', {width: 1024, height: 600});
    //await page.property('zoomFactor', 0.25);
    let png = await page.render(`images/${time}.png`)
    console.log(png)
    let content = await page.property('content');

    let $ = cheerio.load(content)
    let t = $('#a659973 .td_living').text()

    console.log(t)

    await instance.exit()

}
main()
