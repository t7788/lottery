// 引入依赖
var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))

schedule.scheduleJob('0 10 10 * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(time)

    let redis = require("redis")
    let client = redis.createClient(6001, '122.226.180.195', {});
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    let count = 0
    let items = []
    client.get("period", function (err, reply) {
        let period = parseInt(reply)
        let periods = [period, period + 1, period + 2]
        for (let i = 0; i < 3; i++) {
            superagent.get('http://www.okooo.com/zucai/' + periods[i])
                .charset('gb2312')
                .end(function (err, sres) {
                    if (err) {
                        console.log(err)
                        return
                    }

                    let $ = cheerio.load(sres.text)
                    let deadline = $('.overTime em').text().trim()
                    items.push({period: periods[i], deadline: deadline})
                    count++
                    endQuery()
                })
        }
    })

    function endQuery() {
        console.log(items)
        if (count == 3) {
            items.forEach(function (item) {
                client.set("deadline_" + item.period, item.deadline)
            })
            client.quit()
        }
    }
})



