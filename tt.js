const phantom = require('phantom');
const cheerio = require('cheerio')
var content
(async function () {
    const instance = await phantom.create();
    const page = await instance.createPage();
    /* await page.on("onResourceRequested", function(requestData) {
         console.info('Requesting', requestData.url)
     });*/

    const status = await page.open('http://info.sporttery.cn/football/hhad_list.php');
    console.log(status);

    content = await page.property('content');
    //console.log(content);

    await instance.exit();
}());

console.log('c:' + content);