var charset = require('superagent-charset')
var superagent = charset(require('superagent'))
var Promise = require("bluebird")
var agent = Promise.promisifyAll(superagent)
var cheerio = require('cheerio')

superagent.getAsync('http://www.okooo.com/zucai/17111',{header:{}})
    .then(function (body) {
        let $ = cheerio.load(body.text)
        let deadline = $('.overTime').eq(0).text()
        console.log(deadline)
        return agent.getAsync('http://www.okooo.com/zucai/17111')
    })
    .then(function (res) {
        let $ = cheerio.load(res.text)
        let va = $('#txtKwSearch').attr('value')
        console.log(va)
    })
    .catch(function (err) {//轻松处理所有出现的异常
        console.log(err);
    })