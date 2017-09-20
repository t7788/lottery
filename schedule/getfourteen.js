// 引入依赖
let schedule = require('node-schedule')
let superagent = require('superagent')
let moment = require('moment')
let cheerio = require('cheerio')
let phantom = require('phantom')

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
                    let sitepage = null
                    let phInstance = null
                    phantom.create()
                        .then(instance => {
                            phInstance = instance;
                            return instance.createPage();
                        })
                        .then(page => {
                            sitepage = page;
                            return page.open(url);
                        })
                        .then(status => {
                            console.log(status)
                            if ('success' == status) {
                                return sitepage.property('content')
                            }
                        })
                        .then(content => {
                            let $ = cheerio.load(content)
                            let body = $('body').text()
                            let jsonObj = JSON.parse(body)
                            if (jsonObj.status.code == 0) {
                                console.log(periods[i])
                                items.push({key: "fourteen_" + periods[i], info: body})
                                count++
                                endQuery()

                                sitepage.close()
                                phInstance.exit()
                            } else {
                                console.log(jsonObj.status)
                            }

                        })
                        .catch(error => {
                            console.log(error);
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


