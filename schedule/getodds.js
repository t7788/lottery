// 引入依赖
var schedule = require('node-schedule')
var superagent = require('superagent')
var moment = require('moment')
var request = require('request')

schedule.scheduleJob('0 */10 * * * *', function () {
    let day = moment().format('YYYY-MM-DD')
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(time)
    let url = "http://i.sporttery.cn/odds_calculator/get_odds?i_format=json&i_callback=&poolcode[]=had&poolcode[]=hhad&poolcode[]=ttg&poolcode[]=crs&poolcode[]=hafu"

    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36'
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let jsonObj = JSON.parse(body)
            if (jsonObj.status.last_updated) {
                let Redis = require('ioredis');
                let redis = new Redis(6001, '122.226.180.195')
                redis.set("odds_" + day, body)
                redis.quit()
                console.log('succ')
            } else {
                console.log(jsonObj.status)
            }
        } else {
            console.log(error)
        }
    })

})


