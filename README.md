# mini-apps-runtime

A JavaScript library for seamlessly integrating MiniApps with the MyLife client platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

Add the script to your HTML file's `<head>` section before any other scripts:

```html
<script src="https://my-life-platofrm.github.io/mini-apps-runtime/script.js"></script>
```

## API Reference

The library provides two main interfaces: `MyLife.WebApp` and `MyLife.WebView`

### Chat Completions

Send messages and receive responses:

```javascript
// Send a message
MyLife.WebApp.chatCompletions({
  role: 'user',
  message: 'Hello, how are you?'
});

// Listen for responses
MyLife.WebView.onEvent('chat_completions_response', (eventType, eventData) => {
  if (eventData.error) {
    console.error('Error:', eventData.error);
    return;
  }
  console.log('Response:', eventData.response);
});
```

### React Hook Example

Here's how to use the API with React:

```typescript
import { useEffect, useState } from 'react';

export const useMyLife = () => {
  const [responses, setResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.MyLife?.WebView) {
      setError('MyLife WebView is not initialized');
      return;
    }

    window.MyLife.WebView.onEvent('chat_completions_response', (eventType, eventData) => {
      setIsLoading(false);
      if (eventData.error) {
        setError(eventData.error);
        return;
      }
      if (eventData.response) {
        setResponses(prev => [...prev, eventData.response]);
      }
    });
  }, []);

  const sendMessage = async (message: string, role: string = 'user') => {
    if (!window.MyLife?.WebApp) {
      setError('MyLife WebApp is not initialized');
      return;
    }

    setIsLoading(true);
    try {
      window.MyLife.WebApp.chatCompletions({ role, message });
    } catch (error) {
      setError('Error sending message');
      setIsLoading(false);
    }
  };

  return { 
    sendMessage, 
    responses,
    latestResponse: responses[responses.length - 1] || '', 
    isLoading, 
    error 
  };
};
```

## TypeScript Support

Add these type definitions to your project:

```typescript
declare global {
  interface Window {
    MyLife: {
      WebApp: {
        chatCompletions: (params: { role: string; message: string }) => void;
      };
      WebView: {
        onEvent: (event: string, callback: (eventType: string, eventData: any) => void) => void;
      };
    };
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📝 Issues: [GitHub Issues](https://github.com/my-life-platform/mini-apps-runtime/issues)

## Security

Found a security issue? Please report it privately to security@mylife-platform.com

---

Made with ❤️ by [MyLife Platform Team](https://github.com/my-life-platform)
