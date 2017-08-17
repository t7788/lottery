// 获取比赛详细信息

var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var eventproxy = require('eventproxy');
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))

let time = moment().format('YYYY-MM-DD HH:mm:ss')
console.log('start--------')
console.log(time)

let header = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36'
}

let url = "http://live.500.com/?e=2017-08-15"
superagent.get(url)
    .charset('gb2312')
    .set(header)
    .end(function (err, sres) {
        if (!err) {
            let $ = cheerio.load(sres.text)
            let script = $('script').eq(8).html()
            eval(script)
            $("#table_match tbody tr").each(function (index, tr) {
                if (index == 0) {
                    let gy = $(tr).attr('gy')
                    let id = a2b($(tr).attr('fid'))
                    let date = $(tr).find('td').eq(0).text()
                    date = date.replace(/[0-9]/ig, "")
                    let href = $(tr).find('td').eq(6).find('.pk a').eq(1).attr('href');
                    href = 'http://live.500.com' + href.substring(1, href.length)
                    let match = {
                        id: id,
                        date: date,
                        status: a2b($(tr).attr('status')),
                        status_txt: $(tr).find('td').eq(3).text(),
                        league: gy.split(',')[0],
                        bgcolor: $(tr).find('td.ssbox_01').eq(0).attr('bgcolor'),
                        order: $(tr).find('td').eq(2).text(),
                        match_time: $(tr).find('td').eq(3).text(),
                        href: href,
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
                    console.log(match)
                }
            })

        } else {
            console.log(err)
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
