// 引入依赖
var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))

schedule.scheduleJob('0 */5 10 * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(time)
    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });

    let count = 0
    superagent.get("http://www.okooo.com/zucai/")
        .charset('gb2312')
        .end(function (err, sres) {

            if (err) {
                console.log(err)
                return
            }

            let $ = cheerio.load(sres.text)
            let period_prev = $('.float_l.qihao_infor').text().replace(/[^0-9]/ig, "")

            let bonusinfo = {
                sale: $('#SaleInfoSale').text().trim(),
                first: {
                    hitnum: $('#SaleInfoFirstHitNum').eq(0).text().trim(),
                    wager: $('#SaleInfoFirstWager').eq(0).text().trim(),
                },
                second: {
                    hitnum: $('#SaleInfoFirstHitNum').eq(1).text().trim(),
                    wager: $('#SaleInfoFirstWager').eq(1).text().trim(),
                },
                next: $('.float_l.sqgc em').text().trim()
            }
            client.set("bonus_" + period_prev, JSON.stringify(bonusinfo))
            count++
            endQuery()

        })
    superagent.get("http://www.okooo.com/zucai/ren9/")
        .charset('gb2312')
        .end(function (err, sres) {

            if (err) {
                console.log(err)
                return
            }

            let $ = cheerio.load(sres.text)
            let period_prev = $('.float_l.qihao_infor').text().replace(/[^0-9]/ig, "")

            let bonusinfo = {
                sale: $('#SaleInfoSale').text().trim(),
                first: {
                    hitnum: $('#SaleInfoFirstHitNum').text().trim(),
                    wager: $('#SaleInfoFirstWager').text().trim(),
                },
                next: $('.float_l.sqgc em').text().trim()
            }
            client.set("ren9_" + period_prev, JSON.stringify(bonusinfo))
            count++
            endQuery()

        })

    function endQuery() {
        if (count == 2) {
            client.quit()
        }
    }

})



