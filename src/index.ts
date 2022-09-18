import Browser from "webextension-polyfill"

Browser.runtime.onInstalled.addListener((_) => {
  Browser.tabs.create({
    url: 'index.html'
  })
})



