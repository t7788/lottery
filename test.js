// 引入依赖
var schedule = require('node-schedule')
var moment = require('moment')
var cheerio = require('cheerio')
var charset = require('superagent-charset')
var superagent = charset(require('superagent'))

let time = moment().format('YYYY-MM-DD HH:mm:ss')
console.log(time)
let url = "http://www.okooo.com/zucai/"


superagent.get(url)
    .charset('gb2312')
    .end(function (err, sres) {

        if (err) {
            console.log(err)
            return
        }

        let redis = require("redis")
        let client = redis.createClient(6001, '122.226.180.195', {});
        client.on("error", function (err) {
            console.log("Error " + err);
        });

        client.get('test2', function (err, res) {
            console.log(res)
            client.quit()
        });

    })

superagent.get(url)
    .charset('gb2312')
    .end(function (err, sres) {

        if (err) {
            console.log(err)
            return
        }

        let redis = require("redis")
        let client = redis.createClient(6001, '122.226.180.195', {});
        client.on("error", function (err) {
            console.log("Error " + err);
        });

        client.get('test2', function (err, res) {
            console.log(res)
            client.quit()
        });

    })





