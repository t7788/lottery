//var phantom = require("phantom");


var webPage = require('webpage');
var page = webPage.create();



page.open('http://www.baidu.com', function (s) {
    console.log(s);
    phantom.exit();
});

