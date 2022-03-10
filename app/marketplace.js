var fs = require('fs');
var csvjson = require('csvjson');
var tress = require('tress')

var bpPrices = require('./getBackpackData');
var get = require('./getMarketplaceData');
var getPricesClassifides = require('./getPricesClassifides');

var order = require('./order');
var other = require('./other');

var list = other.list();
var logs = other.logs;
let times = 0;

let marketplace, marketplaceOldData;
let orders_information = {undercuted: 0, created: 0, deleted: 0};

async function myProgramStartCommand(){

	console.log('Programm Started')
	try{

		list = other.list();
		let data_prices = await getPricesClassifides.dataPrices()
		if(!data_prices) throw new Error('no list data prices')
		await order.wait(3000)
		let listOrders = await get.data()
		if(!listOrders[0]) throw new Error('no list orders')
		await order.wait(3000)

		await bpPrices.token();

		console.log('Data from Account was gotten')
	

		let i = 1;
		listOrders = listOrders.map((el, index)=>{
			let existOrder = list.find(exist => exist.manncoId === el.manncoId || exist.tfName === other.backpacktf(el.name))

			if(existOrder) {
				el.bpLink = existOrder.bpLink;
				el.tfName = existOrder.tfName;
				el.index = i + 1;
				i += 1;
			}

			return el;
		}).filter(el=> el.tfName && el.manncoId)
		
		createOrders(listOrders, data_prices).then(res=>{
			let interval = 60 * 6;
			let itemValue = listOrders.reduce((sum, el) => sum + el.lowest_price, 0)
			logs(`Count Orders: ${i} itemValue: $${itemValue.toFixed(0)}`)
	        logs(`Undercuted: ${orders_information.undercuted}, Withdraw: ${orders_information.deleted}`)
	        logs(`New checking will start in ${interval} minutes`);

	        setTimeout(function () { myProgramStartCommand(true);  }, 1000 * 60 * interval)

		})
	} catch(er) {
		console.log(er);
		logs('error attempt to start programm, try again in 1 min');
		setTimeout(function () { myProgramStartCommand(true);  }, 1000 * 60 * 1)
	}
}

function createOrders(items, data_prices){

	orders_information = {undercuted: 0, created: 0, deleted: 0};

	marketplace = [];
	
	return new Promise((resolve, reject) =>{

		var q = tress(function(item, callback){

			item.buyMarketPrice = data_prices[item.manncoId].buyMarketPrice;
			item.sellMarketPrice = data_prices[item.manncoId].sellMarketPrice;

			itemTreatment(item, callback).then(() => callback())

		}, 1);

		q.drain = function(){
			other.save(marketplace, 'marketplace')
			logs('==============================')
			logs('All items were succesfully processed', 'green')
			resolve()
		}
	
		q.push(items);
	})
}

async function itemTreatment(item, callback){

		marketplace.push(item)

		let baseIndex = item.sellMarketPrice && item.sellMarketPrice > 0 && item.isd && item.id && item.lowest_price && item.lowest_price > 0;

		let price_difference = item.lowest_price - item.sellMarketPrice;

		let undercuted = price_difference > 0.01 && price_difference < 0.03;

		if(item.lowest_price !== item.sellMarketPrice && baseIndex && undercuted){

			logInfo(item, null, orders_information, price_difference)

			item.sellMarketPrice = item.sellMarketPrice.toFixed(2);
			
			orders_information.undercuted += 1;


			let createInfo = await order.post(item, 'create');
			
			
			if(createInfo) orders_information.undercuted += 1;

			await order.wait(2000);
		}

		// } else if(item.sellMarketPrice < indicatorPrice && baseIndex && false){

		// 	logInfo(item, boughtPrice, orders_information)

		// 	orders_information.deleted += 1;

		// 	let withdrawInfo = await order.post(item, 'withdraw');

		// 	if(withdrawInfo) orders_information.deleted += 1;

		// 	await order.wait(5000);

		// }  
		return;
}

function logInfo(item, boughtPrice, orders_information, price_difference){

	logs('========================')
	logs(item.name, 'gray');
	//logs( 'bp_price: ' + bpItem.SellPrice.toFixed(2) + ' boughtPrice: ' + boughtPrice, 'gray')
	logs('Price difference: ' + price_difference, 'gray')
	logs( 'market_price: ' +  item.sellMarketPrice + ' myPrice: ' +  item.lowest_price, 'gray')
	logs(`${item.index}: info: created: ${orders_information.undercuted}`, 'gray');
	
}

myProgramStartCommand()

