// 引入依赖
var express = require('express')
var cheerio = require('cheerio')
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))

var url = 'http://trade.500.com/jczq/'
var app = express()

app.get('/', function (req, res, next) {

    superagent.get(url)
        .charset('gb2312')
        .end(function (err, sres) {

            // 常规的错误处理
            if (err) {
                return next(err)
            }

            var $ = cheerio.load(sres.text)
            var items = []
            $('.bet_table tr').each(function (idx, element) {
                var $el = $(element)

                items.push({
                    id: $el.find('.game_num').text(),
                    pname: $el.attr('pname'),
                    isend: $el.attr('isend'),
                    pdate: $el.attr('pdate'),
                    pendtime: $el.attr('pendtime'),
                    league: $el.attr('lg'),
                    style: $el.find('.league').attr('style'),
                    match_time: $el.find('.match_time').attr('title'),
                    end_time: $el.find('.end_time').attr('title'),
                    left_team: {
                        name: $el.find('.left_team a').attr('title'),
                        rank: $el.find('.left_team .gray').text(),
                        href: $el.find('.left_team a').attr('href')
                    },
                    right_team: {
                        name: $el.find('.right_team a').attr('title'),
                        rank: $el.find('.right_team .gray').text(),
                        href: $el.find('.right_team a').attr('href')
                    },
                    score: $el.find('td .score').text(),
                    odds: [
                        {
                            concede: 0,
                            win: $el.find('.bet_odds').eq(0).find('.odds_item').eq(0).text(),
                            deuce: $el.find('.bet_odds').eq(0).find('.odds_item').eq(1).text(),
                            lost: $el.find('.bet_odds').eq(0).find('.odds_item').eq(2).text(),
                        },
                        {
                            concede: $el.find('.border_left .concede.t_line.green').text(),
                            win: $el.find('.bet_odds').eq(1).find('.odds_item').eq(0).text(),
                            deuce: $el.find('.bet_odds').eq(1).find('.odds_item').eq(1).text(),
                            lost: $el.find('.bet_odds').eq(1).find('.odds_item').eq(2).text(),
                        }
                    ]
                })
            })

            res.send(items)
        })
})

app.listen(3001, function (req, res) {
    console.log('app is running at port 3000');
})