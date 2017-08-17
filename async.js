var async = require('async');
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))
var cheerio = require('cheerio')

async.waterfall([
    function (callback) {
        superagent.get('http://www.okooo.com/zucai/17111')
            .charset('gb2312')
            .end(function (err, sres) {
                if (err) {
                    console.log(err)
                    return
                }

                let $ = cheerio.load(sres.text)
                let deadline = $('.overTime em').text().trim()
                console.log("1:" + deadline)
                callback(null, deadline);
            })
    },
    function (arg1, callback) {
        console.log("2:" + arg1)
        superagent.get('http://www.okooo.com/zucai/17112')
            .charset('gb2312')
            .end(function (err, sres) {
                if (err) {
                    console.log(err)
                    return
                }

                let $ = cheerio.load(sres.text)
                let deadline = $('.overTime em').text().trim()
                console.log("2:" + deadline)
                callback(null, deadline);
            })
    },
    function (arg1, callback) {
        console.log("3:" + arg1)
        superagent.get('http://www.okooo.com/zucai/17113')
            .charset('gb2312')
            .end((err, sres) => {
                if (err) {
                    console.log(err)
                    return
                }

                let $ = cheerio.load(sres.text)
                let deadline = $('.overTime em').text().trim()
                console.log("3:" + deadline)
                callback(null, deadline);
            })
    }
], function (err, result) {
    // result now equals 'done'
    console.log("final:" + result)
});