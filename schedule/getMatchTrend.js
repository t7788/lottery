//获取每场比赛的赔率趋势
var async = require('async')
var schedule = require('node-schedule')
var moment = require('moment')
var request = require('request')

schedule.scheduleJob('0 */8 * * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('start----------------')
    console.log(time)
    let url = "http://i.sporttery.cn/odds_calculator/get_odds?i_format=json&i_callback=&poolcode[]=had&poolcode[]=hhad"

    var options = {
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36'
        }
    }

    async.waterfall([
        function (callback) {
            request(options, function (error, response, body) {
                let trends = []
                if (!error && response.statusCode == 200) {
                    let jsonObj = JSON.parse(body)
                    for (let key in jsonObj.data) {
                        let match = jsonObj.data[key]
                        let trend = {
                            id: match.num,
                            had: hs(match, 'had') ? [parseFloat(match.had.h_trend), parseFloat(match.had.d_trend), parseFloat(match.had.a_trend)] : [0, 0, 0],
                            hhad: hs(match, 'hhad') ? [parseFloat(match.hhad.h_trend), parseFloat(match.hhad.d_trend), parseFloat(match.hhad.a_trend)] : [0, 0, 0],
                        }
                        trends.push(trend)
                    }
                } else {
                    console.log(error)
                }
                callback(null, trends)
            })
        }
    ], function (err, mArr) {
        let Redis = require('ioredis')
        let redis = new Redis(6001, '122.226.180.195')
        mArr.forEach((match) => {
            redis.hmset('trend_' + match.id, {
                time: time,
                had: JSON.stringify(match.had),
                hhad: JSON.stringify(match.hhad)
            })
            redis.pexpire('trend_' + match.id, 60 * 60 * 1000)
        })

        redis.quit()
        console.log('end------------------')
    })
})

function hs(obj, pt) {
    if (obj.hasOwnProperty(pt)) {
        return true
    } else {
        return false
    }
}

