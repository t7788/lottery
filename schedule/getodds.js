// 引入依赖
var schedule = require('node-schedule')
var superagent = require('superagent')
var moment = require('moment')

schedule.scheduleJob('0 */1 * * * *', function () {

    let day = moment().format('YYYY-MM-DD')
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log(time)
    let url = "http://i.sporttery.cn/odds_calculator/get_odds?i_format=json&i_callback=&poolcode[]=had&poolcode[]=hhad&poolcode[]=ttg&poolcode[]=crs&poolcode[]=hafu"
    superagent.get(url)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36')
        .end(function (err, sres) {

            console.log('superagent')
            if (err) {
                console.log(err)
                return
            }

            let redis = require("redis")
            let client = redis.createClient(6001, '122.226.180.195', {});
            client.on("error", function (err) {
                console.log("Error " + err);
            });

            client.set("odds_" + day, sres.text)
            client.quit()
        })
})


