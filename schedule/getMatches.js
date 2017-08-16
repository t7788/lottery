// 获取比赛详细信息

var schedule = require('node-schedule')
var moment = require('moment')
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
        let trade_url = "http://trade.500.com/jczq/?date=" + day_arr[i]
        superagent.get(trade_url)
            .charset('gb2312')
            .set(header)
            .end(function (err, sres) {

                let l = cheerio.load(sres.text)
                let single_arr = []
                l('.danguan_game_icon').each(function (i, v) {
                    single_arr.push(l(v).parent('tr').attr('fid'))
                })

                if (!err) {
                    let live_url = "http://live.500.com/?e=" + day_arr[i]
                    superagent.get(live_url)
                        .charset('gb2312')
                        .set(header)
                        .end(function (err, sres) {
                            if (!err) {
                                let $ = cheerio.load(sres.text)
                                let script = $('script').eq(8).html()
                                eval(script)
                                $("#table_match tbody tr").each(function (index, tr) {
                                    let gy = $(tr).attr('gy')
                                    let id = a2b($(tr).attr('fid'))
                                    let weekday = $(tr).find('td').eq(0).text()
                                    weekday = weekday.replace(/[0-9]/ig, "")
                                    let number = weekday.replace(/[^0-9]/ig, "")
                                    let fix = l('#bet_content tr[fid=' + id + ']').find('td.border_left p span').text()
                                    let date = l('#bet_content tr[fid=' + id + ']').attr('pdate')
                                    let single = single_arr.indexOf(id.toString()) == -1 ? false : true
                                    let match = {
                                        id: id,
                                        date: date,
                                        weekday: weekday,
                                        number: number,
                                        status: a2b($(tr).attr('status')),
                                        status_txt: $(tr).find('td').eq(4).text(),
                                        league: gy.split(',')[0],
                                        bgcolor: $(tr).find('td.ssbox_01').eq(0).attr('bgcolor'),
                                        order: $(tr).find('td').eq(2).text(),
                                        match_time: $(tr).find('td').eq(3).text(),
                                        single: single,
                                        fix: fix,
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
                            } else {
                                console.log(err)
                            }
                        })
                } else {
                    console.log('trade:' + err)
                }
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