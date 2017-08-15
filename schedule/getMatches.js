// 获取比赛详细信息
var schedule = require('node-schedule')
var moment = require('moment')
var request = require('request')
var cheerio = require('cheerio')
var eventproxy = require('eventproxy');
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))


schedule.scheduleJob('0 */2 * * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('start--------')
    console.log(time)


    let header = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36'
    }
    let today = moment().format('YYYY-MM-DD')
    let yesterday = moment().subtract(1, "days").format('YYYY-MM-DD')
    let day_arr = [today, yesterday]
    let matches = {
        today: [],
        yesterday: [],
    }

    var ep = new eventproxy();
    let Redis = require('ioredis');
    let redis = new Redis(6001, '122.226.180.195')
    for (let i = 0; i < 2; i++) {
        let url = "http://live.500.com/?e=" + day_arr[i]
        superagent.get(url)
            .charset('gb2312')
            .set(header)
            .end(function (err, sres) {
                if (err) {
                    console.log(err)
                    return
                }
                let $ = cheerio.load(sres.text)
                let script = $('script').eq(8).html()
                eval(script)
                $("#table_match tbody tr").each(function (index, tr) {
                    let gy = $(tr).attr('gy')
                    let id = a2b($(tr).attr('fid'))
                    let match = {
                        id: id,
                        status: a2b($(tr).attr('status')),
                        status_txt: $(tr).find('td').eq(4).text(),
                        league: gy.split(',')[0],
                        bgcolor: $(tr).find('td.ssbox_01').eq(0).attr('bgcolor'),
                        order: $(tr).find('td').eq(2).text(),
                        match_time: $(tr).find('td').eq(3).text(),
                        home: {
                            name: gy.split(',')[1],
                            score: a2b($(tr).find('td').eq(6).find('.pk a').eq(0).text()),
                            yellow: a2b($(tr).find('td').eq(5).find('.yellowcard').text()),
                            red: a2b($(tr).find('td').eq(5).find('.redcard').text()),
                        },
                        away: {
                            name: gy.split(',')[2],
                            score: a2b($(tr).find('td').eq(6).find('.pk a').eq(2).text()),
                            yellow: a2b($(tr).find('td').eq(6).find('.yellowcard').text()),
                            red: a2b($(tr).find('td').eq(6).find('.redcard').text()),
                        },
                        fix: 1,
                        had: liveOddsList[id].sp,
                        hhad: liveOddsList[id].rqsp
                    }
                    if (i == 0) {
                        matches.today.push(match)
                    } else {
                        matches.yesterday.push(match)
                    }
                })
                ep.emit('match', i);
            })
    }

    ep.after('match', 2, function (s) {
        let matches_str = JSON.stringify(matches)
        redis.hmset('matches_' + today, {time: time, data: matches_str})
        redis.quit()
        console.log('end--------')
    });

    function a2b(str) {
        if (str == '' || str == null || str == 'undefined' || str == '0') {
            str = 0
        } else {
            str = parseInt(str)
        }
        return str
    }

})