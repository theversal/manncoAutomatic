var axios = require('axios')

var token = '';

exports.token = () => {
	return axios.post('https://api2.prices.tf/auth/access').then(res => {
		token = res.accessToken;
		return true;
	}).catch(err => {
		console.log(err)
		return false
	})
}

exports.data = async (sku) => {

	var options = {
		method: 'post',
		url: `https://api2.prices.tf/prices/${sku}`,
		headers: {
    		'accept:': 'application/json',
    		'Authorization': 'Bearer ' + token
  		}
	}

	return axios.request(options)
}