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

  function onEvent(eventType, callback) {
    if (eventHandlers[eventType] === undefined) {
      eventHandlers[eventType] = [];
    }
    var index = eventHandlers[eventType].indexOf(callback);
    if (index === -1) {
      eventHandlers[eventType].push(callback);
    }
  };

  if (!window.MyLife) {
    window.MyLife = {};
  }

  window.MyLife.WebView = {
    onEvent: onEvent,
    postEvent: postEvent,
    receiveEvent: receiveEvent,
    callEventCallbacks: callEventCallbacks
  };
})();

// WebApp
(function () {
  var WebView = window.MyLife.WebView;
  var WebApp = {};

  function receiveWebViewEvent(eventType) {
    var args = Array.prototype.slice.call(arguments);
    eventType = args.shift();
    WebView.callEventCallbacks('webview:' + eventType, function (callback) {
      callback.apply(WebApp, args);
    });
  }

  function onChatCompletionsResponse(eventType, eventData) {
    receiveWebViewEvent('chatCompletionResponse', {
      error: eventData.error,
      response: eventData.response
    });
  }

  if (!window.MyLife) {
    window.MyLife = {};
  }

  WebApp.chatCompletions = function (params, callback) {
    if (!params || !params.role || !params.message) {
      throw Error('ChatCompletionsParamInvalid');
    }

    WebView.postEvent('chat_completions', false, params);
  };

  window.MyLife.WebApp = WebApp;

  WebView.onEvent('chat_completions_response', onChatCompletionsResponse);
})();
