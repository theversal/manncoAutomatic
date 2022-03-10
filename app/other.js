var csvjson = require('csvjson')
var fs = require('fs')
var path = require('path');
var colors = require('colors');

exports.login = new Login;

exports.deleteSymbols = function deleteSymbols(data){

		data = data.replace(/each/, '')
        data = data.replace(/\,/g, '')
        data = data.replace(/\$/g, '')
       	data = data.replace(/\t/g, '')
        data = Number(data.replace(/\n/g, ''))
    return data;
}

exports.backpacktf = (name) =>{
  return name.replace(/ \(..*\)/, "").trim()
}

exports.list = function list(){

	var classifieds = JSON.parse(fs.readFileSync('./classifieds.json', 'utf8'));
      classifieds = classifieds.map((el, index)=>{
        el.bpLink = el.BuyLink.replace('https://backpack.tf/classifieds/buy/', 'https://backpack.tf/item/get_third_party_prices/');
        el.index = index;
        el.tfName = el.name

        el.created = false;
        return el;
      })
	return classifieds;
}

exports.unnaming = function unnaming(marketLink){
  return marketLink.includes(';australium') && marketLink.includes(';festive') ? marketLink.replace(';festive', '') : marketLink;
}

exports.backpack = function backpack(){
	return JSON.parse(fs.readFileSync('./Price.json', 'utf8'));
}
exports.marketplace = function marketplace(){
  return JSON.parse(fs.readFileSync('./app/json/marketplace.json', 'utf8'));
}

exports.wait = (t) =>{
  return new Promise((resolve, reject) =>{
    setTimeout(function() {
      resolve()
    }, 1000 * 60 * t);
  })
}

function Time(date) {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var date = hour + ":" + min + ":" + sec + " - "; 
    return date;

}

let directions = {
    'info': 'green',
    'error': 'red',
    'Name': 'magenta',
    'Message': 'gray'
  }

exports.log = function log(data, direction){

  let colorText = direction ? colors[directions[direction]](direction)  + ': ' : '';

	console.log(Time() + colorText+ data);
}

exports.logs = function logs(data, color){
   let text = color ? colors[color](data) : data;
    console.log(Time() + text);

}

exports.save = function save(massive, path){
	fs.writeFileSync(`./app/json/${path}.json`, JSON.stringify(massive, null, 4));
}

function Login(){
  this.account = JSON.parse(fs.readFileSync('./accounts.json', 'utf8'));
  this.id = this.account.id;
  this.cookie = this.account.cookie;
  this.key = this.account.key;
  this.secret = this.account.secret;
  this.server = this.account.server;
  this.userid = this.account.userid;

  this.serverAnonim = this.account.server;
  this.cookieAnonim = this.account.cookieAnonim;

  this.proxy = this.account.proxy;
  this.anonproxy = this.account.anonproxy;


    function saveCookie(cooks){

      this.account.cookie = cooks;
      this.cookie = cooks;
      fs.writeFileSync('./accounts.json', JSON.stringify(this.account, null, 4));

    }

    function upAccount(){
      this.account = JSON.parse(fs.readFileSync('./accounts.json', 'utf8'));
    }

    this.upAccount = upAccount;
    this.saveCookie = saveCookie;
}
