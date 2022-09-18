"use strict";

import Browser from "webextension-polyfill";

// type that models transaction items in Tokopedia
type TransactionItem = {
  Ref: string,
  Name: string,
  Type: string,
  State: string,
  Price: number,
  Date: string,
}

//
// query and send transaction items back to handler
//
const scrapTokopediaTrxItems = async (): Promise<Array<TransactionItem>> => {

  // order item lists container (returns list of item transactions)
  // selector: div[data-testid^=order]
  //
  // type of transaction:
  // selector: :parent > section > div > div > div:nth-child(2)
  // example: Pulsa
  //
  // date of transaction:
  // selector: :parent > section > div > div > div:nth-child(3)
  // example: 13 Sep 2022
  //
  // state of transaction:
  // selector: :parent > section > div > div > div:nth-child(4)
  // example: `Berhasil` | `Sedang Dikirim`
  //
  // name of transaction:
  // selector: :parent > section div.product-details > div > h6
  // example: `Indosat 50.000`
  //
  // transaction ref id:
  // selector: :parent > section > div > div > div:nth-child(5)
  // example: IVR/20220913/XXII/IX/XXXXXXXXXX
  //
  // price:
  // selector: :parent > section div.sum-price > div > p:nth-child(2)
  // example: Rp49.500
  //
  const orderItemListElems = document.querySelectorAll('div[data-testid^=order]');

  // storing transaction items
  let orderItems: Array<TransactionItem> = [];

  for (const orderItemElem of orderItemListElems) {

    const orderItem: TransactionItem = {

      Ref: orderItemElem.querySelector(
        'section > div > div > div:nth-child(5)'
      )!.textContent!,

      Name: orderItemElem.querySelector(
        'section div.product-details > div > h6'
      )!.textContent!,

      Type: orderItemElem.querySelector(
        'section > div > div > div:nth-child(2)'
      )!.textContent!,

      State: orderItemElem.querySelector(
        'section > div > div > div:nth-child(4)'
      )!.textContent!,

      // TODO: this still in Rp{number} formats
      Price: parseFloat(orderItemElem.querySelector(
        'section div.sum-price > div > p:nth-child(2)'
      )!.textContent!),

      Date: orderItemElem.querySelector(
        'section > div > div > div:nth-child(3)'
      )!.textContent!

    }

    orderItems.push(orderItem);
  }

  // send the result back to action handler
  // await Browser.runtime.sendMessage({
  //   from: window.URL.toString(),
  //   kind: 'trx-items',
  //   items: orderItems,
  // })

  return orderItems
}

(async () => {

  // fetch btnScrapTrxItems for action.html
  const btnScrapTrxItemsElem: HTMLButtonElement = document.querySelector('btnScrapTrxItems')!!;

  // add button handler for action.html#button#btnScrapTrxItems
  btnScrapTrxItemsElem.addEventListener('click', async (e: _) => {
    const currentTab = await Browser.tabs.getCurrent();

    await Browser.scripting.executeScript({
      target: { tabId: currentTab.id! },
      func: scrapTokopediaTrxItems,
    })
  })

})();
