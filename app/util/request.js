import queryString from 'query-string';
import lodash from 'lodash';
import config from './config.js';
import Mock from 'mockjs';

var request = {};

request.get = function (url,params) {
    if(params){
        url += '?' + queryString.stringify(params);
    }
    return fetch(url)
        .then((response) => response.json())
        .then((response) => {
            return Mock.mock(response);
    })
}

request.post = function (url,body) {
    var options = lodash.extend(cofig.header,{
        body:  JSON.stringify(body)
    })
    return fetch(url,options)
        .then((response) => response.json())
        .then((response) => {
            return Mock.mock(response);
        })
}












module.exports =  request;