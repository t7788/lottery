// 引入依赖

var express = require('express')
var moment = require('moment')

var app = express()
var cheerio = require('cheerio')
var superagent = require('superagent')

/*const https = require('https');

var options = {
    hostname: 'myportal.vtc.edu.hk',
    port: 443,
    path: '/wps/portal',
    method: 'GET',
    secureProtocol: 'TLSv1_method'
};

var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});
req.end();

req.on('error', (e) => {
    console.error(e);
});*/

/*var http = require('http');
var querystring = require('querystring');
var options = {
    host: 'http://i.sporttery.cn/wap/fb_lottery/fb_lottery_match?key=wilo&num=17113', // 这个不用说了, 请求地址
    port: 80,
    path: '/', // 具体路径, 必须以'/'开头, 是相对于host而言的
    method: 'GET', // 请求方式, 这里以post为例
    headers: { // 必选信息, 如果不知道哪些信息是必须的, 建议用抓包工具看一下, 都写上也无妨...
        'Content-Type': 'application/json'
    }
};
http.get(options, function (res) {
    var resData = "";
    res.on("data", function (data) {
        resData += data;
    });
    res.on("end", function () {
        console.log(resData)
    });
})*/

/*var request = require('request');
request('http://i.sporttery.cn/wap/fb_lottery/fb_lottery_match?key=wilo&num=17113', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        //console.log(body)

       /!* console.log(error)
        let $ = cheerio.load(body)
        let deadline = $('.overTime em').text().trim()*!/
        console.log(body)

    }
})*/

var request = require('request')
let url = "http://a.haocai138.com/info/match/Jingcai.aspx?date=2017-08-16"
var options = {
    url: url
};

request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        let $ = cheerio.load(body)
        let is_find = false
        $('a').each(function (idx, ent) {
            console.log($(ent).text())
            if ($(ent).text() == '町田泽维') {

                let id = $(ent).attr('id').replace(/[^0-9]/ig, "")
                console.log('id:' + id + '' + match_id)
                is_find = true
                return false
            }
        })
        if (!is_find) {
            console.log('not')
        }
    }
})




