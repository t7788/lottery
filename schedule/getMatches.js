// 获取比赛详细信息

var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var eventproxy = require('eventproxy');
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))
var async = require('async')

schedule.scheduleJob('0 */1 * * * *', function () {
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
                                    if ($(tr).attr('parentid') == null) {
                                        let id = a2b($(tr).attr('fid'))
                                        let date = l('#bet_content tr[fid=' + id + ']').attr('pdate')
                                        if (date != null) {
                                            let gy = $(tr).attr('gy')
                                            let weeknum = $(tr).find('td').eq(0).text()
                                            let number = weeknum.replace(/[^0-9]/ig, "")
                                            let fix = l('#bet_content tr[fid=' + id + ']').find('td.border_left p span').text()

                                            let weekday = l('#bet_content tr[fid=' + id + ']').parents('.bet_table').eq(0).attr('id')
                                            if (weekday == null || weekday == 'undefined') {
                                                if (l('#bet_content tr[fid=' + id + ']').attr('gdate') != null) {
                                                    weekday = l('#bet_content tr[fid=' + id + ']').attr('gdate').substring(0, 3)
                                                }
                                            } else {
                                                weekday = weekday.substring(2, 5)
                                            }

                                            if (weekday != null) {
                                                weekday = weekday.replace('星期', '周')
                                            }
                                            let single = single_arr.indexOf(id.toString()) == -1 ? false : true
                                            let wkday = weekday + number
                                            let dish = ''
                                            if (i == 0) {
                                                dish = $(tr).find('td').eq(6).find('.pk .fgreen').text()
                                            } else {
                                                dish = $(tr).find('td').eq(6).find('.pk .fhuise').text()
                                            }
                                            let match = {
                                                id: id,
                                                date: date,
                                                weekday: weekday,
                                                number: number,
                                                wkday: wkday,
                                                sort_id: index + 1,//a2b($(tr).attr('infoid')),
                                                status: a2b($(tr).attr('status')),
                                                status_txt: $(tr).find('td').eq(4).text(),
                                                league: gy.split(',')[0],
                                                bgcolor: $(tr).find('td.ssbox_01').eq(0).attr('bgcolor'),
                                                order: $(tr).find('td').eq(2).text(),
                                                match_time: $(tr).find('td').eq(3).text(),
                                                single: single,
                                                fix: fix,
                                                dish: dish,
                                                home: {
                                                    name: gy.split(',')[1],
                                                    score: a2b($(tr).find('td').eq(6).find('.pk a').eq(0).text()),
                                                    yellow: a2b($(tr).find('td').eq(5).find('.yellowcard').text()),
                                                    red: a2b($(tr).find('td').eq(5).find('.redcard').text()),
                                                },
                                                away: {
                                                    name: gy.split(',')[2],
                                                    score: a2b($(tr).find('td').eq(6).find('.pk a').eq(2).text()),
                                                    yellow: a2b($(tr).find('td').eq(7).find('.yellowcard').text()),
                                                    red: a2b($(tr).find('td').eq(7).find('.redcard').text()),
                                                },
                                                had: liveOddsList ? liveOddsList[id].sp : [0, 0, 0],
                                                hhad: liveOddsList ? liveOddsList[id].rqsp : [0, 0, 0]
                                            }
                                            if (i == 0) {
                                                matches.today.push(match)
                                            } else {
                                                matches.yesterday.push(match)
                                            }
                                        }
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

        matches.today.sort((a, b) => {
            return a.sort_id - b.sort_id;
        })
        matches.yesterday.sort((a, b) => {
            return a.sort_id - b.sort_id;
        })


        let idArr = []
        matches.today.forEach((mt) => {
            idArr.push('trend_' + mt.wkday)
        })
        matches.yesterday.forEach((mt) => {
            idArr.push('trend_' + mt.wkday)
        })

        async.mapLimit(idArr, 3, (trendId, callback) => {
            fetchTrend(trendId, callback);
        }, (err, trendArr) => {
            let tArr = new Array()
            trendArr.forEach((trend) => {
                tArr[trend.id] = {
                    had_trend: trend.had != null ? trend.had : [0, 0, 0],
                    hhad_trend: trend.hhad != null ? trend.hhad : [0, 0, 0]
                }
            })
            matches.today.map((mt) => {
                mt.had_trend = tArr['trend_' + mt.wkday].had_trend
                mt.hhad_trend = tArr['trend_' + mt.wkday].hhad_trend
            })
            matches.yesterday.map((mt) => {
                mt.had_trend = tArr['trend_' + mt.wkday].had_trend
                mt.hhad_trend = tArr['trend_' + mt.wkday].hhad_trend
            })

            let matches_str = JSON.stringify(matches)

            redis.hmset('matches_' + today, {time: time, data: matches_str})
            redis.quit()
            console.log('today:' + matches.today.length + " yesterday:" + matches.yesterday.length)
            console.log('end--------')
        })

    })
    var fetchTrend = function (trendId, callback) {
        redis.hmget(trendId, ['had', 'hhad']).then((hdArr) => {
            callback(null, {id: trendId, had: JSON.parse(hdArr[0]), hhad: JSON.parse(hdArr[1])});
        })
    }
})


function a2b(str) {
    if (str == '' || str == null || str == 'undefined' || str == '0') {
        str = 0
    } else {
        str = parseInt(str)
    }
    return str
}