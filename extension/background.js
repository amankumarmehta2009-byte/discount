importScripts("config.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "OPEN_DISCOUNT_PANEL" && sender.tab?.windowId) {
    chrome.sidePanel.open({ windowId: sender.tab.windowId }).then(() => sendResponse({ok:true}))
      .catch(error => sendResponse({ok:false, error:String(error)}));
    return true;
  }
  if (message?.type === "GET_API_BASE") {
    sendResponse({apiBase: DISCOUNT_API_BASE});
  }
});
