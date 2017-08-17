var queuefun = require('queue-fun');
var Queue = queuefun.Queue(); //初始化Promise异步队列类
var q = queuefun.Q;  //配合使用的Promise流程控制类，也可以使用q.js代替
var queue1 = new queue(10);
var request = require('request')
function getbody(url){
    var deferred = q.defer();
    request(url,function(err,res){
        if(err) return deferred.reject(err)
        deferred.resolve(res.body);
    })
    return deferred.promise;
}
//存储并分析URL拿到后续需要爬取的URL(去外网链接，去重等)
function saveAndGeturls(body){
    //...
    return arr;
}
//要爬取的URL都插入队列中
function toQueue(arr){
    arr.forEach(function(v,i){
        queue1.go(getbody,[v])
            .then(function(body){
                var arr = saveAndGeturls(body)
                toQueue(arr);
            })
    })
}
toQueue(['http://baidu.com']) //从入口页开始