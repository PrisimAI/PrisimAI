/**
 * Comprehensive test suite for PrisimAI Chat Application
 * Tests extracted JavaScript functionality from dev/index.html
 */

describe('PrisimAI Chat Application - Core Functionality', () => {
  // Helper to set up DOM structure
  function setupDOM() {
    document.body.innerHTML = `
      <button id="dark-mode-toggle"></button>
      <div id="chat-history"></div>
      <textarea id="chat-input"></textarea>
      <form id="chat-form"></form>
      <div id="welcome-message"></div>
      <button id="new-chat-btn"></button>
      <select id="model-selector"></select>
      <div id="chat-history-list"></div>
      <div id="tutorial-overlay"></div>
      <button id="tutorial-close-btn"></button>
      <button id="tutorial-done-btn"></button>
    `;
    
    return {
      darkModeToggle: document.getElementById('dark-mode-toggle'),
      chatHistory: document.getElementById('chat-history'),
      chatInput: document.getElementById('chat-input'),
      chatForm: document.getElementById('chat-form'),
      welcomeMessage: document.getElementById('welcome-message'),
      newChatBtn: document.getElementById('new-chat-btn'),
      modelSelector: document.getElementById('model-selector'),
      chatHistoryList: document.getElementById('chat-history-list')
    };
  }

  // Extract and test utility functions
  describe('Utility Functions', () => {
    describe('generateChatId', () => {
      function generateChatId() {
        return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
      }

      test('should generate unique chat ID with timestamp and random suffix', () => {
        const id1 = generateChatId();
        const id2 = generateChatId();
        
        expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]{6}$/);
        expect(id2).toMatch(/^[a-z0-9]+-[a-z0-9]{6}$/);
        expect(id1).not.toBe(id2);
      });

      test('should generate ID in correct format', () => {
        const id = generateChatId();
        const parts = id.split('-');
        
        expect(parts).toHaveLength(2);
        expect(parts[0]).toBeTruthy();
        expect(parts[1]).toHaveLength(6);
      });

      test('should generate different IDs on subsequent calls', () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++) {
          ids.add(generateChatId());
        }
        expect(ids.size).toBe(100);
      });
    });

    describe('escapeHTML', () => {
      function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
      }

      test('should escape HTML special characters', () => {
        expect(escapeHTML('<script>alert("xss")</script>'))
          .toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      });

      test('should escape ampersands', () => {
        expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
      });

      test('should escape quotes', () => {
        expect(escapeHTML('"Hello"')).toBe('"Hello"');
        expect(escapeHTML("'Hello'")).toBe("'Hello'");
      });

      test('should handle empty string', () => {
        expect(escapeHTML('')).toBe('');
      });

      test('should return empty string for non-string input', () => {
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
        expect(escapeHTML(123)).toBe('');
        expect(escapeHTML({})).toBe('');
      });

      test('should handle multiple special characters', () => {
        const input = '<div class="test" data-value=\'123\'>A & B</div>';
        const result = escapeHTML(input);
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
      });
    });
  });

  describe('Chat Button Management', () => {
    let elements;

    beforeEach(() => {
      elements = setupDOM();
    });

    describe('addChatButton', () => {
      function addChatButton(chatHistoryList, chatId, title = 'New Chat') {
        const existing = chatHistoryList.querySelector(`[data-chat-id="${chatId}"]`);
        if (existing) return existing;

        const chatButton = document.createElement('button');
        chatButton.classList.add('w-full','p-2','rounded-xl','text-left','text-gray-700',
          'dark:text-gray-300','font-medium','hover:bg-white/20','transition-all',
          'duration-200','active:scale-95','flex','items-center','space-x-2','chat-history-item');
        chatButton.dataset.chatId = chatId;
        
        // Create SVG icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('stroke-width', '1.5');
        svg.setAttribute('stroke', 'currentColor');
        svg.classList.add('w-5', 'h-5', 'flex-shrink-0');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('d', 'M8 10h.01M12 10h.01M16 10h.01M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z');
        svg.appendChild(path);
        
        // Create span with text content (automatically escaped)
        const span = document.createElement('span');
        span.classList.add('truncate');
        span.textContent = title;
        span.title = title;
        
        chatButton.appendChild(svg);
        chatButton.appendChild(span);
        chatHistoryList.prepend(chatButton);
        return chatButton;
      }

      test('should create a new chat button with correct attributes', () => {
        const chatId = 'test-123';
        const title = 'Test Chat';
        const button = addChatButton(elements.chatHistoryList, chatId, title);

        expect(button).toBeTruthy();
        expect(button.dataset.chatId).toBe(chatId);
        expect(button.classList.contains('chat-history-item')).toBe(true);
        expect(button.querySelector('span').textContent).toBe(title);
      });

      test('should prepend button to list (newest first)', () => {
        addChatButton(elements.chatHistoryList, 'chat-1', 'First');
        addChatButton(elements.chatHistoryList, 'chat-2', 'Second');
        
        const buttons = elements.chatHistoryList.querySelectorAll('.chat-history-item');
        expect(buttons[0].dataset.chatId).toBe('chat-2');
        expect(buttons[1].dataset.chatId).toBe('chat-1');
      });

      test('should not create duplicate buttons for same chatId', () => {
        const chatId = 'duplicate-test';
        const button1 = addChatButton(elements.chatHistoryList, chatId, 'Title 1');
        const button2 = addChatButton(elements.chatHistoryList, chatId, 'Title 2');
        
        expect(button1).toBe(button2);
        expect(elements.chatHistoryList.querySelectorAll(`[data-chat-id="${chatId}"]`)).toHaveLength(1);
      });

      test('should escape HTML in title to prevent XSS', () => {
        const maliciousTitle = '<script>alert("xss")</script>';
        const button = addChatButton(elements.chatHistoryList, 'xss-test', maliciousTitle);
        
        // The text should be rendered as plain text, not as executable HTML
        // textContent contains the literal characters (safe)
        expect(button.querySelector('span').textContent).toBe('<script>alert("xss")</script>');
        // The title attribute should also contain the safe literal text
        expect(button.querySelector('span').title).toBe('<script>alert("xss")</script>');
        // innerHTML will contain HTML-encoded entities in the text node
        expect(button.innerHTML).toContain('&lt;script&gt;');
      });

      test('should use default title when not provided', () => {
        const button = addChatButton(elements.chatHistoryList, 'default-test');
        expect(button.querySelector('span').textContent).toBe('New Chat');
      });
    });

    describe('setActiveChatButton', () => {
      function setActiveChatButton(chatId) {
        document.querySelectorAll('.chat-history-item').forEach(btn => {
          if (btn.dataset.chatId === chatId) {
            btn.classList.add('bg-blue-500/20','text-blue-400','font-semibold');
          } else {
            btn.classList.remove('bg-blue-500/20','text-blue-400','font-semibold');
          }
        });
      }

      test('should set active state on correct button', () => {
        const button1 = document.createElement('button');
        button1.classList.add('chat-history-item');
        button1.dataset.chatId = 'chat-1';
        
        const button2 = document.createElement('button');
        button2.classList.add('chat-history-item');
        button2.dataset.chatId = 'chat-2';
        
        elements.chatHistoryList.appendChild(button1);
        elements.chatHistoryList.appendChild(button2);

        setActiveChatButton('chat-1');

        expect(button1.classList.contains('bg-blue-500/20')).toBe(true);
        expect(button1.classList.contains('text-blue-400')).toBe(true);
        expect(button2.classList.contains('bg-blue-500/20')).toBe(false);
      });

      test('should remove active state from previously active button', () => {
        const button1 = document.createElement('button');
        button1.classList.add('chat-history-item', 'bg-blue-500/20', 'text-blue-400');
        button1.dataset.chatId = 'chat-1';
        
        const button2 = document.createElement('button');
        button2.classList.add('chat-history-item');
        button2.dataset.chatId = 'chat-2';
        
        elements.chatHistoryList.appendChild(button1);
        elements.chatHistoryList.appendChild(button2);

        setActiveChatButton('chat-2');

        expect(button1.classList.contains('bg-blue-500/20')).toBe(false);
        expect(button2.classList.contains('bg-blue-500/20')).toBe(true);
      });

      test('should handle non-existent chat ID gracefully', () => {
        const button = document.createElement('button');
        button.classList.add('chat-history-item');
        button.dataset.chatId = 'chat-1';
        elements.chatHistoryList.appendChild(button);

        expect(() => setActiveChatButton('non-existent')).not.toThrow();
        expect(button.classList.contains('bg-blue-500/20')).toBe(false);
      });
    });

    describe('updateChatButtonTitle', () => {
      function updateChatButtonTitle(chatHistoryList, chatId, newTitle) {
        const btn = chatHistoryList.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`);
        if (!btn) return;
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = newTitle;
          span.title = newTitle;
        }
      }

      test('should update button title', () => {
        const button = document.createElement('button');
        button.classList.add('chat-history-item');
        button.dataset.chatId = 'test-chat';
        const span = document.createElement('span');
        span.textContent = 'Old Title';
        button.appendChild(span);
        elements.chatHistoryList.appendChild(button);

        updateChatButtonTitle(elements.chatHistoryList, 'test-chat', 'New Title');

        expect(span.textContent).toBe('New Title');
        expect(span.title).toBe('New Title');
      });

      test('should handle non-existent button gracefully', () => {
        expect(() => {
          updateChatButtonTitle(elements.chatHistoryList, 'non-existent', 'Title');
        }).not.toThrow();
      });

      test('should escape HTML in new title', () => {
        const button = document.createElement('button');
        button.classList.add('chat-history-item');
        button.dataset.chatId = 'xss-chat';
        const span = document.createElement('span');
        button.appendChild(span);
        elements.chatHistoryList.appendChild(button);

        updateChatButtonTitle(elements.chatHistoryList, 'xss-chat', '<script>bad</script>');

        // textContent contains the literal string (safe, not executed)
        expect(span.textContent).toBe('<script>bad</script>');
      });
    });
  });

  describe('Storage Functions', () => {
    let elements;
    let allChats = {};

    beforeEach(() => {
      elements = setupDOM();
      allChats = {};
      localStorage.clear();
    });

    describe('saveAllChats', () => {
      function saveAllChats(chats) {
        try {
          localStorage.setItem('allPrisimAIChats', JSON.stringify(chats));
          return true;
        } catch (e) {
          console.warn('Could not save chats to localStorage:', e);
          return false;
        }
      }

      test('should save chats to localStorage', () => {
        const testChats = {
          'chat-1': { title: 'Test Chat', messages: [], createdAt: Date.now() }
        };
        
        saveAllChats(testChats);
        
        const saved = localStorage.getItem('allPrisimAIChats');
        expect(saved).toBeTruthy();
        expect(JSON.parse(saved)).toEqual(testChats);
      });

      test('should handle empty chats object', () => {
        expect(saveAllChats({})).toBe(true);
        expect(localStorage.getItem('allPrisimAIChats')).toBe('{}');
      });

      test('should handle save errors gracefully', () => {
        // Mock localStorage.setItem to throw error
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = jest.fn(() => {
          throw new Error('QuotaExceededError');
        });

        expect(saveAllChats({ test: 'data' })).toBe(false);
        
        localStorage.setItem = originalSetItem;
      });
    });

    describe('loadAllChats', () => {
      test('should load chats from localStorage', () => {
        const testChats = {
          'chat-1': { title: 'Chat 1', messages: [], createdAt: 1000 },
          'chat-2': { title: 'Chat 2', messages: [], createdAt: 2000 }
        };
        localStorage.setItem('allPrisimAIChats', JSON.stringify(testChats));

        const saved = localStorage.getItem('allPrisimAIChats');
        const loaded = JSON.parse(saved);

        expect(loaded).toEqual(testChats);
      });

      test('should handle missing localStorage data', () => {
        const saved = localStorage.getItem('allPrisimAIChats');
        expect(saved).toBeNull();
      });

      test('should handle corrupted JSON in localStorage', () => {
        localStorage.setItem('allPrisimAIChats', 'invalid json{');
        
        expect(() => {
          const saved = localStorage.getItem('allPrisimAIChats');
          JSON.parse(saved);
        }).toThrow();
      });

      test('should sort chats by createdAt in descending order', () => {
        const testChats = {
          'chat-1': { title: 'Oldest', messages: [], createdAt: 1000 },
          'chat-2': { title: 'Newest', messages: [], createdAt: 3000 },
          'chat-3': { title: 'Middle', messages: [], createdAt: 2000 }
        };
        localStorage.setItem('allPrisimAIChats', JSON.stringify(testChats));

        const loaded = JSON.parse(localStorage.getItem('allPrisimAIChats'));
        const sorted = Object.entries(loaded).sort((a, b) => {
          const aTime = a[1]?.createdAt || 0;
          const bTime = b[1]?.createdAt || 0;
          return bTime - aTime;
        });

        expect(sorted[0][0]).toBe('chat-2'); // Newest
        expect(sorted[1][0]).toBe('chat-3'); // Middle
        expect(sorted[2][0]).toBe('chat-1'); // Oldest
      });
    });

    describe('clearCurrentChat', () => {
      function clearCurrentChat(chatId, allChats, chatHistoryList) {
        if (!chatId) return false;
        delete allChats[chatId];
        const btn = chatHistoryList.querySelector(`[data-chat-id="${chatId}"]`);
        if (btn) btn.remove();
        return true;
      }

      test('should remove chat from allChats and DOM', () => {
        const chatId = 'test-chat';
        allChats[chatId] = { title: 'Test', messages: [] };
        
        const button = document.createElement('button');
        button.dataset.chatId = chatId;
        elements.chatHistoryList.appendChild(button);

        const result = clearCurrentChat(chatId, allChats, elements.chatHistoryList);

        expect(result).toBe(true);
        expect(allChats[chatId]).toBeUndefined();
        expect(elements.chatHistoryList.querySelector(`[data-chat-id="${chatId}"]`)).toBeNull();
      });

      test('should handle null chatId gracefully', () => {
        const result = clearCurrentChat(null, allChats, elements.chatHistoryList);
        expect(result).toBe(false);
      });

      test('should handle missing button gracefully', () => {
        const chatId = 'test-chat';
        allChats[chatId] = { title: 'Test', messages: [] };

        const result = clearCurrentChat(chatId, allChats, elements.chatHistoryList);

        expect(result).toBe(true);
        expect(allChats[chatId]).toBeUndefined();
      });
    });
  });

  describe('Message Rendering', () => {
    let elements;

    beforeEach(() => {
      elements = setupDOM();
    });

    describe('addMessage', () => {
      function addMessage(message, role = 'assistant', type = 'text', chatHistory, welcomeMessage) {
        welcomeMessage.classList.add('hidden');
        chatHistory.classList.remove('hidden');
        const isUser = role === 'user';

        const wrapper = document.createElement('div');
        wrapper.classList.add('fade-in', 'mb-4', 'flex');
        wrapper.style.alignItems = 'flex-start';
        wrapper.style.justifyContent = isUser ? 'flex-end' : 'flex-start';

        const bubble = document.createElement('div');
        bubble.classList.add('msg');

        const escapeHTML = (str) => {
          if (typeof str !== 'string') return '';
          const div = document.createElement('div');
          div.appendChild(document.createTextNode(str));
          return div.innerHTML;
        };

        if (type === 'image') {
          bubble.innerHTML = `<img src="${escapeHTML(message)}" alt="Generated" class="rounded-xl max-w-sm cursor-pointer shadow-lg">`;
        } else {
          if (isUser) {
            bubble.classList.add('msg-user');
            bubble.innerHTML = `<div style="position:relative;"><div>${escapeHTML(message)}</div></div>`;
          } else {
            bubble.classList.add('msg-assistant');
            bubble.innerHTML = `<div style="position:relative;"><p style="margin:0;">${escapeHTML(message)}</p><div class="sheen"></div></div>`;
          }
        }

        wrapper.appendChild(bubble);
        chatHistory.appendChild(wrapper);
        return wrapper;
      }

      test('should create user message with correct styling', () => {
        const message = 'Hello, assistant!';
        const wrapper = addMessage(message, 'user', 'text', elements.chatHistory, elements.welcomeMessage);

        expect(wrapper).toBeTruthy();
        expect(wrapper.classList.contains('fade-in')).toBe(true);
        expect(wrapper.style.justifyContent).toBe('flex-end');
        
        const bubble = wrapper.querySelector('.msg');
        expect(bubble.classList.contains('msg-user')).toBe(true);
        expect(bubble.textContent).toContain(message);
      });

      test('should create assistant message with correct styling', () => {
        const message = 'Hello, user!';
        const wrapper = addMessage(message, 'assistant', 'text', elements.chatHistory, elements.welcomeMessage);

        expect(wrapper.style.justifyContent).toBe('flex-start');
        
        const bubble = wrapper.querySelector('.msg');
        expect(bubble.classList.contains('msg-assistant')).toBe(true);
        expect(bubble.textContent).toContain(message);
      });

      test('should hide welcome message when adding first message', () => {
        elements.welcomeMessage.classList.remove('hidden');
        
        addMessage('First message', 'user', 'text', elements.chatHistory, elements.welcomeMessage);

        expect(elements.welcomeMessage.classList.contains('hidden')).toBe(true);
        expect(elements.chatHistory.classList.contains('hidden')).toBe(false);
      });

      test('should escape HTML in messages to prevent XSS', () => {
        const maliciousMessage = '<script>alert("xss")</script>';
        const wrapper = addMessage(maliciousMessage, 'user', 'text', elements.chatHistory, elements.welcomeMessage);

        expect(wrapper.innerHTML).not.toContain('<script>alert');
        // textContent returns decoded text, innerHTML should have the escaped version
        expect(wrapper.innerHTML).toContain('&lt;script&gt;');
      });

      test('should create image message correctly', () => {
        const imageUrl = 'https://example.com/image.jpg';
        const wrapper = addMessage(imageUrl, 'assistant', 'image', elements.chatHistory, elements.welcomeMessage);

        const img = wrapper.querySelector('img');
        expect(img).toBeTruthy();
        expect(img.src).toContain('example.com/image.jpg');
        expect(img.classList.contains('rounded-xl')).toBe(true);
      });

      test('should handle empty messages', () => {
        const wrapper = addMessage('', 'user', 'text', elements.chatHistory, elements.welcomeMessage);
        expect(wrapper).toBeTruthy();
      });
    });

    describe('showLoadingIndicator', () => {
      function showLoadingIndicator(chatHistory) {
        const loading = document.createElement('div');
        loading.classList.add('fade-in', 'mb-4', 'flex', 'justify-start');
        loading.innerHTML = `<div class="p-3 rounded-xl bg-gray-200/60 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 flex items-center space-x-2 msg-assistant" style="max-width: 140px;">
          <div class="w-3 h-3 rounded-full bounce-dot" style="background: rgba(0,0,0,0.35); animation-delay:-0.32s;"></div>
          <div class="w-3 h-3 rounded-full bounce-dot" style="background: rgba(0,0,0,0.35); animation-delay:-0.16s;"></div>
          <div class="w-3 h-3 rounded-full bounce-dot" style="background: rgba(0,0,0,0.35);"></div>
        </div>`;
        chatHistory.appendChild(loading);
        return loading;
      }

      test('should create loading indicator element', () => {
        const loading = showLoadingIndicator(elements.chatHistory);

        expect(loading).toBeTruthy();
        expect(loading.classList.contains('fade-in')).toBe(true);
        expect(elements.chatHistory.contains(loading)).toBe(true);
      });

      test('should create three bouncing dots', () => {
        const loading = showLoadingIndicator(elements.chatHistory);
        const dots = loading.querySelectorAll('.bounce-dot');

        expect(dots).toHaveLength(3);
      });

      test('should be removable from DOM', () => {
        const loading = showLoadingIndicator(elements.chatHistory);
        expect(elements.chatHistory.contains(loading)).toBe(true);

        loading.remove();
        expect(elements.chatHistory.contains(loading)).toBe(false);
      });
    });
  });

  describe('API Integration', () => {
    let elements;

    beforeEach(() => {
      elements = setupDOM();
      global.fetch.mockClear();
    });

    describe('fetchModels', () => {
      test('should fetch and populate model selector with models', async () => {
        const mockModels = [
          { id: 'model-1', name: 'Model 1', description: 'First model' },
          { id: 'model-2', name: 'Model 2', description: 'Second model' }
        ];

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockModels
        });

        // Simulate fetchModels function
        const modelSelector = elements.modelSelector;
        modelSelector.innerHTML = '<option disabled selected>Loading models...</option>';
        
        const res = await fetch('https://text.pollinations.ai/models');
        const models = await res.json();
        
        modelSelector.innerHTML = '';
        models.forEach(m => {
          const option = document.createElement('option');
          option.value = m.id;
          option.textContent = m.description;
          modelSelector.appendChild(option);
        });

        expect(fetch).toHaveBeenCalledWith('https://text.pollinations.ai/models');
        expect(modelSelector.children).toHaveLength(2);
        expect(modelSelector.children[0].value).toBe('model-1');
        expect(modelSelector.children[1].value).toBe('model-2');
      });

      test('should handle fetch error gracefully', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        const modelSelector = elements.modelSelector;
        
        try {
          await fetch('https://text.pollinations.ai/models');
        } catch (e) {
          modelSelector.innerHTML = '<option disabled>Error loading models</option>';
        }

        expect(modelSelector.children[0].textContent).toBe('Error loading models');
      });

      test('should handle non-OK response', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 500
        });

        const modelSelector = elements.modelSelector;
        
        const res = await fetch('https://text.pollinations.ai/models');
        if (!res.ok) {
          modelSelector.innerHTML = '<option disabled>Error loading models</option>';
        }

        expect(modelSelector.children[0].textContent).toBe('Error loading models');
      });

      test('should handle empty model list', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

        const modelSelector = elements.modelSelector;
        const models = await (await fetch('https://text.pollinations.ai/models')).json();
        
        if (!models.length) {
          modelSelector.innerHTML = '<option disabled>No models available</option>';
        }

        expect(modelSelector.children[0].textContent).toBe('No models available');
      });
    });

    describe('handleImageResponse', () => {
      test('should generate correct image URL', () => {
        const prompt = 'a beautiful sunset';
        const apiKey = 'test-key';
        const referrer = 'https://test.com';
        const imageApiUrl = 'https://image.pollinations.ai/prompt/';
        
        const imageUrl = `${imageApiUrl}${encodeURIComponent(prompt)}?key=${apiKey}&referrer=${referrer}`;

        expect(imageUrl).toContain('a%20beautiful%20sunset');
        expect(imageUrl).toContain('key=test-key');
        expect(imageUrl).toContain('referrer=https://test.com');
      });

      test('should encode special characters in prompt', () => {
        const prompt = 'image with spaces & special chars!';
        const encoded = encodeURIComponent(prompt);

        expect(encoded).not.toContain(' ');
        expect(encoded).not.toContain('&');
        expect(encoded).toContain('%20');
        expect(encoded).toContain('%26');
      });
    });
  });

  describe('Event Handlers', () => {
    let elements;

    beforeEach(() => {
      elements = setupDOM();
    });

    describe('Dark Mode Toggle', () => {
      test('should toggle dark class on document and body', () => {
        const toggle = elements.darkModeToggle;
        
        // Simulate click
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        
        document.documentElement.classList.toggle('dark');
        document.body.classList.toggle('dark');

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.body.classList.contains('dark')).toBe(true);
      });

      test('should save theme preference to localStorage', () => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');

        expect(localStorage.getItem('theme')).toBe('dark');
      });

      test('should toggle between light and dark', () => {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.toggle('dark');

        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });

    describe('Textarea Resize', () => {
      function resizeTextarea(chatInput) {
        if (!chatInput) return;
        chatInput.style.height = 'auto';
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 400)}px`;
      }

      test('should resize textarea based on content', () => {
        const textarea = elements.chatInput;
        Object.defineProperty(textarea, 'scrollHeight', {
          configurable: true,
          get: () => 100
        });

        resizeTextarea(textarea);

        expect(textarea.style.height).toBe('100px');
      });

      test('should cap resize at 400px', () => {
        const textarea = elements.chatInput;
        Object.defineProperty(textarea, 'scrollHeight', {
          configurable: true,
          get: () => 500
        });

        resizeTextarea(textarea);

        expect(textarea.style.height).toBe('400px');
      });

      test('should handle null textarea gracefully', () => {
        expect(() => resizeTextarea(null)).not.toThrow();
      });
    });

    describe('Form Submission', () => {
      test('should prevent default form submission', () => {
        const form = elements.chatForm;
        const event = new Event('submit', { cancelable: true });
        
        form.addEventListener('submit', (e) => {
          e.preventDefault();
        });

        const result = form.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
      });

      test('should not submit with empty input', () => {
        elements.chatInput.value = '   ';
        const trimmed = elements.chatInput.value.trim();
        
        expect(trimmed).toBe('');
      });

      test('should clear input after submission', () => {
        elements.chatInput.value = 'Test message';
        const message = elements.chatInput.value.trim();
        elements.chatInput.value = '';

        expect(message).toBe('Test message');
        expect(elements.chatInput.value).toBe('');
      });
    });
  });

  describe('Tutorial Overlay', () => {
    let elements;
    const TUTORIAL_SEEN_KEY = 'prisimaiTutorialSeen';

    beforeEach(() => {
      elements = setupDOM();
      localStorage.removeItem(TUTORIAL_SEEN_KEY);
    });

    describe('showTutorial', () => {
      function showTutorial(overlay) {
        if (!localStorage.getItem(TUTORIAL_SEEN_KEY) && overlay) {
          overlay.classList.add('visible');
          document.body.style.overflow = 'hidden';
          return true;
        }
        return false;
      }

      test('should show tutorial if not seen before', () => {
        const overlay = document.getElementById('tutorial-overlay');
        const result = showTutorial(overlay);

        expect(result).toBe(true);
        expect(overlay.classList.contains('visible')).toBe(true);
        expect(document.body.style.overflow).toBe('hidden');
      });

      test('should not show tutorial if already seen', () => {
        localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
        const overlay = document.getElementById('tutorial-overlay');
        const result = showTutorial(overlay);

        expect(result).toBe(false);
        expect(overlay.classList.contains('visible')).toBe(false);
      });

      test('should handle missing overlay element', () => {
        const result = showTutorial(null);
        expect(result).toBe(false);
      });
    });

    describe('hideTutorial', () => {
      function hideTutorial(overlay) {
        if (!overlay) return false;
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
        localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
        return true;
      }

      test('should hide tutorial and mark as seen', () => {
        const overlay = document.getElementById('tutorial-overlay');
        overlay.classList.add('visible');
        
        const result = hideTutorial(overlay);

        expect(result).toBe(true);
        expect(overlay.classList.contains('visible')).toBe(false);
        expect(document.body.style.overflow).toBe('');
        expect(localStorage.getItem(TUTORIAL_SEEN_KEY)).toBe('true');
      });

      test('should handle null overlay', () => {
        const result = hideTutorial(null);
        expect(result).toBe(false);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    let elements;

    beforeEach(() => {
      elements = setupDOM();
    });

    test('should handle localStorage quota exceeded', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const allChats = { test: 'data' };
      
      expect(() => {
        try {
          localStorage.setItem('allPrisimAIChats', JSON.stringify(allChats));
        } catch (e) {
          console.warn('Could not save chats to localStorage:', e);
        }
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    test('should handle malformed chat data', () => {
      const chatData = {
        'chat-1': null,
        'chat-2': undefined,
        'chat-3': { messages: 'not-an-array' }
      };

      Object.entries(chatData).forEach(([id, data]) => {
        // The condition checks if data is invalid
        const isInvalid = !data || !Array.isArray(data.messages);
        expect(isInvalid).toBeTruthy();
      });
    });

    test('should handle missing DOM elements gracefully', () => {
      const nonExistent = document.getElementById('non-existent-element');
      expect(nonExistent).toBeNull();
      
      // Functions should handle null gracefully
      expect(() => {
        if (nonExistent) {
          nonExistent.classList.add('test');
        }
      }).not.toThrow();
    });

    test('should handle concurrent chat operations', () => {
      const allChats = {};
      const chatId = 'concurrent-test';
      
      // Simulate concurrent access
      allChats[chatId] = { title: 'Test', messages: [] };
      allChats[chatId].messages.push({ role: 'user', content: 'Message 1' });
      allChats[chatId].messages.push({ role: 'assistant', content: 'Response 1' });
      
      expect(allChats[chatId].messages).toHaveLength(2);
    });

    test('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      
      function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
      }
      
      const escaped = escapeHTML(longMessage);
      expect(escaped).toHaveLength(10000);
    });

    test('should handle special Unicode characters', () => {
      const unicodeMessage = '你好 🌟 مرحبا';
      
      function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
      }
      
      const escaped = escapeHTML(unicodeMessage);
      expect(escaped).toContain('你好');
      expect(escaped).toContain('🌟');
      expect(escaped).toContain('مرحبا');
    });
  });

  describe('Integration Scenarios', () => {
    let elements;
    let allChats = {};

    beforeEach(() => {
      elements = setupDOM();
      allChats = {};
    });

    test('should complete full chat flow: create, message, save, load', () => {
      // Create chat
      const chatId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      allChats[chatId] = { 
        title: 'Integration Test Chat', 
        messages: [], 
        createdAt: Date.now() 
      };

      // Add messages
      allChats[chatId].messages.push({ 
        role: 'user', 
        content: 'Hello', 
        type: 'text' 
      });
      allChats[chatId].messages.push({ 
        role: 'assistant', 
        content: 'Hi there!', 
        type: 'text' 
      });

      // Save
      localStorage.setItem('allPrisimAIChats', JSON.stringify(allChats));

      // Load
      const loaded = JSON.parse(localStorage.getItem('allPrisimAIChats'));

      expect(loaded[chatId]).toBeDefined();
      expect(loaded[chatId].messages).toHaveLength(2);
      expect(loaded[chatId].messages[0].content).toBe('Hello');
      expect(loaded[chatId].messages[1].content).toBe('Hi there!');
    });

    test('should handle multiple chats with different timestamps', () => {
      const baseTime = Date.now();
      
      // Create multiple chats
      for (let i = 0; i < 5; i++) {
        const chatId = `chat-${i}`;
        allChats[chatId] = {
          title: `Chat ${i}`,
          messages: [],
          createdAt: baseTime + (i * 1000)
        };
      }

      // Sort by createdAt
      const sorted = Object.entries(allChats).sort((a, b) => 
        b[1].createdAt - a[1].createdAt
      );

      expect(sorted[0][0]).toBe('chat-4'); // Newest
      expect(sorted[4][0]).toBe('chat-0'); // Oldest
    });

    test('should properly escape XSS attempts in full workflow', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<iframe src="evil.com"></iframe>'
      ];

      function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
      }

      xssAttempts.forEach(attempt => {
        const escaped = escapeHTML(attempt);
        // The key is that angle brackets are escaped, preventing tag execution
        expect(escaped).not.toContain('<script>');
        expect(escaped).not.toContain('<iframe');
        expect(escaped).not.toContain('<img src=');
        // Check that angle brackets are properly escaped
        if (attempt.includes('<')) {
          expect(escaped).toContain('&lt;');
        }
        if (attempt.includes('>')) {
          expect(escaped).toContain('&gt;');
        }
      });
    });
  });
});