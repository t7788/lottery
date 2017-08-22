var phantom = require('phantom')
var cheerio = require('cheerio')
var sitepage = null
var phInstance = null
phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        return page.open('http://info.sporttery.cn/football/hhad_list.php');
    })
    .then(status => {
        console.log(status);
        return sitepage.property('content');
    })
    .then(content => {
        let $ = cheerio.load(content)
        let t = $('#list_96904 .vsTd').text()
        console.log(t)
        sitepage.close();
        phInstance.exit();
    })
    .catch(error => {
        console.log(error);
        phInstance.exit();
    })