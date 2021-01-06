'use strict'

const dazaar = require('dazaar')
const swarm = require('dazaar/swarm')
const Payment = require('@dazaar/payment-lightning')
const terms = require('bitfinex-terminal-terms-of-use')
const Orderbook = require('bitfinex-terminal-order-book')

const card = require('../cards/paid/orderbooks/bitfinex.terminal.btcusd.orderbook.json')

const market = dazaar('dbs/terminal-orderbook-btcusd-lnd')
const buyer = market.buy(card, { sparse: false, terms })

buyer.on('feed', function () {
  console.log('got feed')

  const o = new Orderbook(buyer.feed)
  doQuery(o)
})

buyer.ready(function () {
  console.log('ready')

  const payment = new Payment(buyer)
  payment.requestInvoice(100, function (err, invoice) {
    if (err) console.log(err)
    console.log(invoice)
  })

  swarm(buyer)
})

async function doQuery (o) {
  const s = o.createReadStream({
    start: new Date().getTime() - (1000 * 60 * 10),
    live: true
  })

  // alternative: range query with max 5 results:
  // const start = new Date().getTime() - (1000 * 60 * 5)
  // const end = Date.now()
  // const s = o.createReadStream({ limit: 5, start, end  })

  for await (const data of s) {
    console.log('--->', data)
  }
}
