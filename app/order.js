var tress = require('tress')
var axios = require('axios')
var urlencode = require("urlencode");

var other = require('./other');

var logs = other.logs;
var account = other.login;

var agent = require('tunnel').httpsOverHttp({
  proxy: {
     host: account.proxy.host,
     port: account.proxy.port,
     proxyAuth: `${account.proxy.username}:${account.proxy.password}`,
   }
});

var count = 0;

exports.post = function post(data, type){

	let link = {
		'create': 'https://mannco.store/requests/sell.php',
		'withdraw': 'https://mannco.store/requests/sell.php'
	};

	let send = (type) => {

		if(type === 'create') return `steamid=${account.id}&ids=${data.id}&price=${data.sellMarketPrice}&previous=${data.created ? 1 : 0}&new=1&nn=${data.isd}`;
		if(type === 'withdraw') return `steamid=${account.id}&ids=${data.id}&price=0&previous=${data.created ? 1 : 0}&new=${data.created ? 0 : 2}`;
	}

	return postRequest(link[type], send(type))
			.then(res=>{
				if(res.data && type !== 'withdraw') logs(res.data, 'green')
					else if(res.data && type === 'withdraw ') logs(res.data + ' - item was withdrawn', 'green')
				return res.data
				
			}).catch(err=>{
				console.log(err)
				logs(data.name + ' was not ' + type, 'red')
				return false
		})

}


function postRequest(link, send){

	var options = {

		method: 'post',
		url: link,
		headers: {
    		'User-Agent': account.server,
    		'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    		Cookie: account.cookie
  	},
		data: send
	}
	if(account.proxy.host.length > 0){
		options.httpsAgent = agent;
		options.port = 443;
	}
	return axios.request(options)
}

exports.wait = function wait(time) {
	return new Promise((resolve, reject) => {
		setTimeout(function() {resolve()}, time);
	})
}
