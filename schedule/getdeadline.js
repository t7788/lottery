// 引入依赖
var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))

schedule.scheduleJob('0 10 10 * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(time)

    let Redis = require('ioredis');
    let client = new Redis(6001, '122.226.180.195')

    let count = 0
    let items = []

    client.get('period').then(function (result) {
        let period = parseInt(result)
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
        if (count == 3) {
            let num = 0
            console.log(items)
            items.forEach(function (item) {
                client.set("deadline_" + item.period, item.deadline).then(function (result) {
                    console.log(result)
                    num++
                    endGet()
                })
            })

            function endGet() {
                if (num == 3) {
                    console.log('succ')
                    client.quit()
                }
            }
        }
    }
})



