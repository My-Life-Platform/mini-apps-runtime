// WebView
(function () {
  var eventHandlers = {};

  function postEvent(eventType, callback, eventData) {
    if (!callback) {
      callback = function () { };
    }

    if (eventData === undefined) {
      eventData = '';
    }

    if (window.MyLifeWebViewProxy !== undefined) {
      MyLifeWebViewProxy.postEvent(eventType, JSON.stringify(eventData));
    } else {
      callback({ notAvailable: true });
    }
  };

  function receiveEvent(eventType, eventData) {
    callEventCallbacks(eventType, function (callback) {
      callback(eventType, eventData);
    });
  }

  function callEventCallbacks(eventType, func) {
    var curEventHandlers = eventHandlers[eventType];
    if (curEventHandlers === undefined ||
      !curEventHandlers.length) {
      return;
    }
    for (var i = 0; i < curEventHandlers.length; i++) {
      try {
        func(curEventHandlers[i]);
      } catch (e) { }
    }
  }

  if (!window.Telegram) {
    window.Telegram = {};
  }

  window.Telegram.WebView = {
    postEvent: postEvent,
    receiveEvent: receiveEvent,
    callEventCallbacks: callEventCallbacks
  };
})();

// WebApp
(function () {
  var WebView = window.Telegram.WebView;
  var WebApp = {};

  function onChatCompletionResponse(eventType, eventData) {
    if (eventData.req_id && webAppCallbacks[eventData.req_id]) {
      var requestData = webAppCallbacks[eventData.req_id];
      delete webAppCallbacks[eventData.req_id];

      if (requestData.callback) {
        requestData.callback(eventData.error, eventData.response);
      }
      receiveWebViewEvent('chatCompletionResponse', {
        error: eventData.error,
        response: eventData.response
      });
    }
  }

  if (!window.Telegram) {
    window.Telegram = {};
  }

  WebApp.chatCompletions = function (params, callback) {
    if (!params || !params.role || !params.message) {
      console.error('[Telegram.WebApp] Role and message are required');
      throw Error('WebAppChatCompletionsParamInvalid');
    }

    WebView.postEvent('mini_app_chat_completion', false, params);
  };

  window.Telegram.WebApp = WebApp;

  WebView.onEvent('chat_completion_response', function (eventType, eventData) {
    if (eventData.req_id && webAppCallbacks[eventData.req_id]) {
      var requestData = webAppCallbacks[eventData.req_id];
      delete webAppCallbacks[eventData.req_id];

      if (requestData.callback) {
        requestData.callback(eventData.error, eventData.response);
      }
    }
  });
})();
