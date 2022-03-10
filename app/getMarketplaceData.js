var fs = require('fs');
var cheerio = require('cheerio')

var other = require('./other');

var list = other.list();
var account = other.login;

//var cloudscraper = require('cloudscraper').defaults({ 'proxy': `http://${account.proxy.username}:${account.proxy.password}@${account.proxy.host}:${account.proxy.port}` });
var cloudscraper = require('cloudscraper');
exports.data = async function data(type){

  var options = {
    uri: 'https://mannco.store/inventory',
    headers: {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'user-agent': account.server,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: account.cookie
    }
  }
  
  return cloudscraper(options).then(function(body){
    var items = [];
    var items_new =[]

    $ = cheerio.load(body)
    $('#site-inventory-items > li').each(function() {
      let name = $(this).attr('data-name')
      let price = $(this).attr('data-price')
      let id = $(this).attr('data-id')
      let isd = $(this).attr('data-isd')

      if(name && price && price !== '' && name !== ''){
        price = price.replace(/\n/g, '')
        price = Number(price.replace(/\$/, '')) / 100;

        name = name.indexOf(' ') === 0 ? name.replace(' ', '') : name;

        items_new.push({
          name, lowest_price: price, isd, id,  manncoId: Number(isd)
        })
      }
    })

    $('ul#on-sale-items > li').each(function() {
      let name = $(this).attr('data-name')
      let price = $(this).attr('data-price')
      let id = $(this).attr('data-id')
      let isd = $(this).attr('data-isd')

      if(name && price && price !== '' && name !== ''){
        price = price.replace(/\n/g, '')
        price = Number(price.replace(/\$/, '')) / 100;
        //sellMarketPrice = Number(sellMarketPrice.replace(/\n/g, '').replace(/\$/, ''))/100

        name = name.indexOf(' ') === 0 ? name.replace(' ', '') : name;
        items.push({
          name, lowest_price: price, isd, id,  manncoId: Number(isd), created: true
        })
      }
    })

    items = items.concat(items_new.filter(el=> !items.some(i => i.manncoId === el.manncoId)))
    items = items.filter((el, index, array)=> el.manncoId != 1).reverse()
    return items;
  }).catch(err=>{
      console.log(err)
      return false
  })
}