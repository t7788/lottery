// 引入依赖
var schedule = require('node-schedule')
var superagent = require('superagent')
var moment = require('moment')
var cheerio = require('cheerio')

schedule.scheduleJob('0 0 */2 * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(time)
    superagent.get('http://trade.500.com/sfc/')
        .end(function (err, sres) {

            if (err) {
                console.log(err)
                return
            }
            let $ = cheerio.load(sres.text)
            let period = $('#expect_tab a').eq(0).attr('data-val')
            console.log(period)
            if (period) {
                let url = "http://i.sporttery.cn/wap/fb_lottery/fb_lottery_match?key=wilo&num=" + period
                superagent.get(url)
                    .end(function (err, sres) {
                        if (err) {
                            console.log(err)
                            return
                        }

                        let redis = require("redis")
                        let client = redis.createClient(6001, '122.226.180.195', {});
                        client.on("error", function (err) {
                            console.log("Error " + err);
                        });

                        client.set("period", period)
                        client.set("fourteen_" + period, sres.text)

                        client.quit()
                    })
            }
        })
})



