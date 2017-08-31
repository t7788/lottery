// 获取比赛详细信息

var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))
var async = require('async')

schedule.scheduleJob('*/30 * * * * *', function () {
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('start--------')
    console.log(time)
    let today = moment().format('YYYY-MM-DD')
    let Redis = require('ioredis');
    let redis = new Redis(6001, '122.226.180.195')
    redis.hget('matches_' + today, 'data').then(function (result) {
        let matches = JSON.parse(result)
        let match_urls_arr = [];
        let baseUrl = 'http://live.500.com/detail.php?fid='
        let tMts = matches['today']
        for (let index in tMts) {
            if (tMts[index].status == 1 || tMts[index].status == 3) {
                let id = tMts[index].id
                let url = baseUrl + id + "&r=1"
                match_urls_arr.push(url)
            }
        }

        let yMts = matches['yesterday']
        for (let index in yMts) {
            if (yMts[index].status == 1 || yMts[index].status == 3) {
                let id = yMts[index].id
                let url = baseUrl + id + "&r=1"
                match_urls_arr.push(url)
            }
        }

        async.mapLimit(match_urls_arr, 5, (url, callback) => {
            fetchUrl(url, callback);
        }, (err, event_arr) => {
            async.mapLimit(event_arr, 10, (event, callback) => {
                redis.hset('MatchEvents', event.match_id, JSON.stringify(event.event)).then((res) => {
                    callback(null, res)
                })
            }, (err, reses) => {
                redis.quit()
                console.log(reses)
                console.log('end--------')
            })
        })

    })
})


var fetchUrl = function (url, callback) {
    let header = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36'
    }
    superagent.get(url)
        .charset('gb2312')
        .set(header)
        .end(function (err, sres) {
            if (err) {
                console.log(err)
                return
            }
            let $ = cheerio.load(sres.text)

            let match_id = parseInt(url.match(/fid=(\S*)&r=1/)[1])
            let match_event = {match_id: match_id, event: []}
            $('.mtable tr').each((k, v) => {
                if (k > 0) {
                    let event = {time: '', name: '', match: '', detail: ''}
                    let time = $(v).find('td').eq(2).text()//时间
                    if (!isEmpt(time)) {
                        event.time = time.substring(0, time.length - 1)
                        let eName = toEventName($(v).find('td').eq(0).find('img').attr('src'))
                        if (eName) {
                            event.match = 0
                            event.name = eName
                            event.detail = $(v).find('td').eq(1).text()
                            if (event.name == '换人') {
                                event.detail = event.detail.replace(')(', '|').replace('(', '').replace(')', '')
                            }
                        } else {
                            event.match = 1
                            event.name = toEventName($(v).find('td').eq(4).find('img').attr('src'))
                            event.detail = $(v).find('td').eq(3).text()
                            if (event.name == '换人') {
                                event.detail = event.detail.replace(')(', '|').replace('(', '').replace(')', '')
                            }
                        }
                        match_event.event.push(event)
                    }
                }
            })
            callback(null, match_event)
        })
}

function toEventName(str) {
    let event_arr = ['入球', '乌龙', '点球', '黄牌', '红牌', '两黄变红', '入球无效', '换人']
    if (str == '' || str == null || str == 'undefined' || str == '0') {
        return false
    } else {
        let sp = str.split('/')
        let name = sp[sp.length - 1]
        let i = parseInt(name.split('.')[0]) - 1
        return event_arr[i]
    }

}

function isEmpt(str) {
    if (str == '' || str == ' ' || str == null || str == 'undefined') {
        return true
    } else {
        return false
    }
}
