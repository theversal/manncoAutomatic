var csvjson = require('csvjson');
var tress = require('tress');
var axios = require('axios')
var cheerio = require('cheerio');
var fs = require('fs')
var request = require('request')
//var cloudscraper = require('cloudscraper');
var other = require('./other');
var account = other.login;
var cloudscraper = require('cloudscraper');

if(account.anonproxy.host.length > 0){
	cloudscraper = cloudscraper.defaults({ 'proxy': `http://${account.anonproxy.username}:${account.anonproxy.password}@${account.anonproxy.host}:${account.anonproxy.port}` })
}

const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');


let logs = other.logs;
var items = [];

exports.data = function data(order){
	return getDataFromMarketplace(order);
}

const proxyAgent = new HttpsProxyAgent(`http://${account.anonproxy.username}:${account.anonproxy.password}@${account.anonproxy.host}:${account.anonproxy.port}`);

exports.dataPrices = () => {
	
	var options = {
		uri: 'https://mannco.store/requests/getinfo.php',
		headers: {
		  'accept': 'application/json, text/javascript, */*; q=0.01',
		  'user-agent': account.server,
		  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
		  Cookie: account.cookie
		}
	}

	return cloudscraper(options).then(async function(res){
	
		if(res.length == 0) return false
		let data = res.split(',').reduce((array, el)=> {
			let item = el.split(';')
			array[item[0]] = {};
			array[item[0]].sellMarketPrice = item[2]/100
			array[item[0]].buyMarketPrice = item[1]/100
			return array

		}, {})
		
		other.save(data, 'prices')
		return data
	}).catch(er => {
		console.log(er)
		return false
	})
}

function getDataFromMarketplace(order){

	let url = 'https://mannco.store/item/' + order.manncoId;
	return cloudscraper(url)
	.then(function(res){

		var $ = cheerio.load(res);
		
		var name = $('div > div > div.card-item > h2').text();
            name = name.replace(/\n/g, '');
            name = name.replace(/\t/g, '').replace('  ', ' ');
            name = name.indexOf(' ') === 0 ? name.replace(' ', '') : name;
           	name = name.indexOf('★ ') >= 0 ? name.replace('Unusual ', '').replace('★ ', '') : name;
			name = name.replace('Uncraftable', 'Non-Craftable');


        var highest_buy_order = $('.table.table-striped.table.table-striped td').first().text();
            highest_buy_order = other.deleteSymbols(highest_buy_order);

		let lowest_price = $('div.row > div:nth-child(1) > div > div > span.important-text').text();
			lowest_price = other.deleteSymbols(lowest_price);

		if(name !== order.tfName && name !== order.tfName.replace('\'', ' ') && name !== order.tfName.replace('\'', '')){
			return false
		}

    	let data = {
			tfName: order.tfName,
			lowest_price,
			highest_buy_order
		}

		if(order.created === 0){
			items.push(data)
		}

		return data;

	})
	.catch(function(err){
		logs('error getDataFromMarketplace', 'red')
		console.log(err)
		return false;
	})
}