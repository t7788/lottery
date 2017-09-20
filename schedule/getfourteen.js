// 引入依赖
var schedule = require('node-schedule')
var superagent = require('superagent')
var moment = require('moment')
var cheerio = require('cheerio')
var request = require('request')
var http = require('http')


schedule.scheduleJob('0 */30 * * * *', function () {
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
                period = parseInt(period)
                let Redis = require('ioredis');
                let redis = new Redis(6001, '122.226.180.195')
                let count = 0
                let items = []
                redis.set("period", period)

                let periods = [period - 1, period]
                console.log(periods)
                for (let i = 0; i < 2; i++) {
                    let url = "http://i.sporttery.cn/wap/fb_lottery/fb_lottery_match?key=wilo&num=" + periods[i]
                    var options = {
                        url: url,
                        headers: {
                            'Host': 'i.sporttery.cn',
                            'Cookie': 'COLLCK=1186171230; Hm_lvt_860f3361e3ed9c994816101d37900758=1503048846; COLLCK=1186171230',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:55.0) Gecko/20100101 Firefox/55.0'
                        }
                    }

                    request(options, function (error, response, body) {
                        console.log(body)
                        if (!error && response.statusCode == 200) {
                            let jsonObj = JSON.parse(body)
                            if (jsonObj.status.code == 0) {
                                items.push({key: "fourteen_" + periods[i], info: body})
                                count++
                                endQuery()
                            } else {
                                console.log(jsonObj.status)
                            }
                        } else {
                            console.log(error)
                        }
                    })
                }

                function endQuery() {
                    if (count == 2) {
                        items.forEach(function (item) {
                            redis.set(item.key, item.info).then(function (result) {
                                console.log(result)
                            })
                        })
                        redis.quit()
                    }
                }
            }
        })
})



