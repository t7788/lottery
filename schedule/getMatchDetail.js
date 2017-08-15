// 获取比赛详细信息
var schedule = require('node-schedule')
var moment = require('moment')
var request = require('request')
var cheerio = require('cheerio')
var eventproxy = require('eventproxy');


//schedule.scheduleJob('0 */1 * * * *', function () {
let day = moment().format('YYYY-MM-DD')
let time = moment().format('YYYY-MM-DD HH:mm:ss')
console.log('start--------')
console.log(time)

let headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.13 Safari/537.36'
}
var ep = new eventproxy();
let count = 0
let Redis = require('ioredis');
let client = new Redis(6001, '122.226.180.195')
client.get("odds_" + day).then(function (result) {

    let json = JSON.parse(result)
    let data = json.data
    let lg = getJsonLength(data)
    for (let index in data) {
        let match_id = data[index].id
        let h_cn = data[index].h_cn
        let h_cn_abbr = data[index].h_cn_abbr
        let url = "http://a.haocai138.com/info/match/Jingcai.aspx?date=" + data[index].b_date
        var options = {
            url: url,
            headers: headers
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let $ = cheerio.load(body)
                let is_find = false
                $('a').each(function (idx, ent) {
                    if ($(ent).text() == h_cn || $(ent).text() == h_cn_abbr) {
                        let id = $(ent).attr('id').replace(/[^0-9]/ig, "")
                        console.log('id:' + id + 'match_id:' + match_id)
                        count++
                        console.log('count:' + count)
                        setMatchDetail(id, match_id)
                        is_find = true
                        return false
                    }
                })
                if (!is_find) {
                    console.log(h_cn)
                    ep.emit('match', match_id);
                }

            }
        })
    }

    ep.after('match', lg, function (topics) {
        console.log('final:');
        console.log(topics);
        client.quit()

        console.log('end--------')
    });
})


function getJsonLength(json) {
    var jsonLength = 0;
    for (var i in json) {
        jsonLength++;
    }
    return jsonLength;
}

function setMatchDetail(id, match_id) {
    let url = "http://a.haocai138.com/info/match/detail.aspx?id=" + id
    var options = {
        url: url,
        headers: {
            headers
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body)
            let match_event = {
                home: {goal: 0, red: 0, yellow: 0, shift: 0},
                away: {goal: 0, red: 0, yellow: 0, shift: 0},
                events: []
            }
            $('#matchData .content').each(function (index, content) {
                if ($(content).find('th').text().indexOf('详细事件') > -1) {
                    $(content).find('table tr').each(function (idx, element) {
                        if (idx > 1) {
                            let $ement = $(element)
                            let event = {time: '', name: '', match: '', detail: ''}
                            $ement.find('td').each(function (i, ent) {
                                //主队事件详情
                                if (i == 0 && $(ent).text()) {
                                    event.match = 'home'
                                    let name_arr = []
                                    $(ent).find('a').each(function (n, ta) {
                                        name_arr.push($(ta).text())
                                    })
                                    event.detail = name_arr.join('|')
                                }

                                //主队事件名称
                                if (i == 1 && $(ent).find('img').attr('title')) {
                                    event.name = $(ent).find('img').attr('title')
                                }

                                //时间
                                if (i == 2) {
                                    event.time = $(ent).text()
                                }

                                //客队事件名称
                                if (i == 3 && $(ent).find('img').attr('title')) {
                                    event.name = $(ent).find('img').attr('title')
                                }

                                //客队事件详情
                                if (i == 4 && $(ent).text()) {
                                    event.match = 'away'
                                    let name_arr = []
                                    $(ent).find('a').each(function (n, ta) {
                                        name_arr.push($(ta).text())
                                    })
                                    event.detail = name_arr.join('|')
                                }
                            })
                            switch (event.name) {
                                case '入球':
                                    if (event.match == 'home') {
                                        match_event.home.goal++
                                    } else {
                                        match_event.away.goal++
                                    }
                                    break
                                case '红牌':
                                    if (event.match == 'home') {
                                        match_event.home.red++
                                    } else {
                                        match_event.away.red++
                                    }
                                    break
                                case '黄牌':
                                    if (event.match == 'home') {
                                        match_event.home.yellow++
                                    } else {
                                        match_event.away.yellow++
                                    }
                                    break
                                case '换人':
                                    if (event.match == 'home') {
                                        match_event.home.shift++
                                    } else {
                                        match_event.away.shift++
                                    }
                                    break

                                default:
                                    break

                            }
                            match_event.events.push(event)
                        }
                    })
                }
            })

            client.set("match_" + match_id, JSON.stringify(match_event))
            ep.emit('match', JSON.stringify(match_event));

        } else {
            console.log(error)
            console.log(response.statusCode)
        }
    })
}


//})