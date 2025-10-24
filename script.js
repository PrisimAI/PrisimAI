/*
 * PrismAI Chat Script
 * Updated with new features:
 * - New API Endpoint & Key
 * - Memory System (/remember, /whoami)
 * - Command System (/summarize, /rewrite, /research, /clearcache, /theme, /persona)
 * - Voice-to-Text (Web Speech API)
 * - Text-to-Speech (Web Speech API)
 * - Basic Offline Mode detection
 * - Customizable Themes (CSS Variables)
 * - AI Typing Indicator
 * - Quick Actions Toolbar
 * - Enhanced Export (.txt, .md, .json)
 * - Model Grouping (<optgroup>)
 * - Smart Retry System (1 retry)
 */

(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "tm2922ucwi");

// ---------- Configuration ----------
const config = {
    // NEW FEATURE: Updated API Endpoint and Key
    apiKey: 'HnmNucebqbTDorAfFAkbBGUOYzQVHTcEdHdKKGQQIosjgMativUHGRrUxlYpmKGC',
    referrer: 'https://prisimai.github.io/PrismAI/index.html',
    textApiUrl: 'https://enter.pollinations.ai/api/generate/openai', // New Endpoint
    imageApiUrl: 'https://image.pollinations.ai/prompt/',
    requestTimeout: 30000,
    maxMessageLength: 1000,
    cacheExpiration: 24 * 60 * 60 * 1000,
    messagesPerPage: 20,
    maxRetries: 1, // NEW FEATURE: Smart Retry System
};

// ---------- Utilities & DOM Refs ----------
const darkModeToggle = document.getElementById('dark-mode-toggle');
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');
const welcomeMessage = document.getElementById('welcome-message');
const newChatBtn = document.getElementById('new-chat-btn');
const exportChatBtn = document.getElementById('export-chat-btn');
const modelSelector = document.getElementById('model-selector');
const chatHistoryList = document.getElementById('chat-history-list');
const chatContainer = document.getElementById('chat-container');

// NEW FEATURE: Dynamic Elements
let typingIndicator;
let micButton;
let quickActionsBar;

let currentChatId = null;
let allChats = {};
let isRecognizingSpeech = false;
let speechRecognition;

// ---------- Helper Functions ----------
function generateChatId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function validateInput(message) {
    if (message.length > config.maxMessageLength) {
        showErrorNotification(`Message is too long (max ${config.maxMessageLength} characters).`);
        return false;
    }
    // Allowing <> for /rewrite command, but still risky.
    // if (/[{}]/g.test(message)) {
    //     showErrorNotification('Message contains invalid characters.');
    //     return false;
    // }
    return true;
}

function getCachedResponse(prompt) {
    const cache = JSON.parse(localStorage.getItem('apiCache') || '{}');
    const entry = cache[prompt];
    if (entry && Date.now() - entry.timestamp < config.cacheExpiration) {
        return entry.response;
    }
    return null;
}

function cacheResponse(prompt, response) {
    const cache = JSON.parse(localStorage.getItem('apiCache') || '{}');
    cache[prompt] = { response, timestamp: Date.now() };
    localStorage.setItem('apiCache', JSON.stringify(cache));
}

// NEW FEATURE: Basic Offline Mode check
function isOffline() {
    return !navigator.onLine;
}

// ---------- Error Notification ----------
function showErrorNotification(message) {
    const errorNotification = document.getElementById('error-notification');
    const errorMessage = document.getElementById('error-message');
    if (errorNotification && errorMessage) {
        errorMessage.textContent = message;
        errorNotification.classList.remove('hidden');
        errorNotification.style.opacity = '1';
        setTimeout(() => {
            errorNotification.style.opacity = '0';
            setTimeout(() => errorNotification.classList.add('hidden'), 300);
        }, 5000);
    }
}

// ---------- Sidebar chat button management ----------
function addChatButton(chatId, title = 'New Chat') {
    const existing = chatHistoryList.querySelector(`[data-chat-id="${chatId}"]`);
    if (existing) return existing;

    const chatButton = document.createElement('button');
    chatButton.classList.add('w-full','p-3','rounded-xl','text-left','text-gray-700','dark:text-gray-300','font-medium','hover:bg-white/20','transition-all','duration-200','active:scale-95','flex','items-center','space-x-2','chat-history-item');
    chatButton.dataset.chatId = chatId;
    chatButton.setAttribute('aria-label', `Select chat: ${title}`);
    const safeTitle = escapeHTML(title);
    chatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
        </svg>
        <span class="truncate" title="${safeTitle}">${safeTitle}</span>
    `;
    chatHistoryList.prepend(chatButton);
    return chatButton;
}

function setActiveChatButton(chatId) {
    document.querySelectorAll('.chat-history-item').forEach(btn => {
        if (btn.dataset.chatId === chatId) {
            btn.classList.add('bg-blue-500/20','text-blue-400','font-semibold');
        } else {
            btn.classList.remove('bg-blue-500/20','text-blue-400','font-semibold');
        }
    });
}

function updateChatButtonTitle(chatId, newTitle) {
    const btn = chatHistoryList.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`);
    if (!btn) return;
    const span = btn.querySelector('span');
    if (span) {
        const safeTitle = escapeHTML(newTitle);
        span.textContent = safeTitle;
        span.title = safeTitle;
        btn.setAttribute('aria-label', `Select chat: ${safeTitle}`);
    }
}

// ---------- Chat selection & load ----------
function selectChat(chatId) {
    if (chatId === null || chatId === 'new-chat-placeholder') {
        currentChatId = generateChatId();
        allChats[currentChatId] = { title: 'New Chat', messages: [], createdAt: Date.now() };
        addChatButton(currentChatId, allChats[currentChatId].title);
        setActiveChatButton(currentChatId);
        loadChatMessages([]);
        chatInput.placeholder = 'Message PrismAI ✨...';
        saveAllChats();
        return;
    }

    if (!allChats[chatId]) {
        console.warn(`Chat ${chatId} missing, creating new`);
        selectChat(null);
        return;
    }

    currentChatId = chatId;
    const chatData = allChats[chatId];
    loadChatMessages(chatData.messages || []);
    setActiveChatButton(chatId);
    chatInput.placeholder = `Message ${escapeHTML(chatData.title)}...`;
    saveAllChats();
}

function loadChatMessages(messages, start = 0, limit = config.messagesPerPage) {
    chatHistory.innerHTML = '';
    const slicedMessages = messages.slice(start, start + limit);
    if (!slicedMessages.length && messages.length === 0) {
        welcomeMessage.classList.remove('hidden');
        chatHistory.classList.add('hidden');
        return;
    }
    welcomeMessage.classList.add('hidden');
    chatHistory.classList.remove('hidden');

    slicedMessages.forEach(msg => {
        addMessage(msg.content, msg.role, msg.type || 'text', false, msg.timestamp);
    });
    requestAnimationFrame(() => { chatHistory.scrollTop = chatHistory.scrollHeight; });
}

// ---------- Persisting ----------
function saveAllChats() {
    try {
        localStorage.setItem('allPrisimAIChats', JSON.stringify(allChats));
    } catch (e) {
        console.warn('Could not save chats to localStorage:', e);
        showErrorNotification('Failed to save chat history.');
    }
}

function loadAllChats() {
    const saved = localStorage.getItem('allPrisimAIChats');
    if (!saved) {
        selectChat(null);
        return;
    }
    try {
        allChats = JSON.parse(saved) || {};
        const sorted = Object.entries(allChats).sort((a,b) => (b[1]?.createdAt||0) - (a[1]?.createdAt||0));
        sorted.forEach(([id, data]) => addChatButton(id, data.title || 'Chat'));
        const first = sorted[0]?.[0];
        if (first) selectChat(first);
        else selectChat(null);
    } catch (e) {
        console.error('Error loading chats:', e);
        localStorage.removeItem('allPrisimAIChats');
        selectChat(null);
        showErrorNotification('Failed to load chat history.');
    }
}

// NEW FEATURE: Enhanced Export Options
function exportChat() {
    if (!currentChatId || !allChats[currentChatId]) {
        showErrorNotification('No chat selected to export.');
        return;
    }
    
    const format = prompt("Enter export format: 'json', 'txt', or 'md'", 'md');
    if (!format || !['json', 'txt', 'md'].includes(format.toLowerCase())) {
        return; // User cancelled or entered invalid format
    }
    
    const chatData = allChats[currentChatId];
    let content = '';
    let mimeType = '';
    let fileExt = '';

    switch (format.toLowerCase()) {
        case 'txt':
            content = formatChatAsTxt(chatData);
            mimeType = 'text/plain';
            fileExt = 'txt';
            break;
        case 'md':
            content = formatChatAsMd(chatData);
            mimeType = 'text/markdown';
            fileExt = 'md';
            break;
        case 'json':
        default:
            content = JSON.stringify(chatData, null, 2);
            mimeType = 'application/json';
            fileExt = 'json';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrismAI_Chat_${chatData.title.replace(/\s+/g, '_')}_${currentChatId}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatChatAsTxt(chatData) {
    let text = `Chat Title: ${chatData.title}\n`;
    text += `Exported: ${new Date().toLocaleString()}\n\n`;
    chatData.messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        text += `[${time}] ${msg.role === 'user' ? 'You' : 'PrismAI'}:\n${msg.content}\n\n`;
    });
    return text;
}

function formatChatAsMd(chatData) {
    let md = `# Chat: ${chatData.title}\n`;
    md += `**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
    chatData.messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const sender = msg.role === 'user' ? 'You' : 'PrismAI';
        md += `**${sender}** (*${time}*):\n\n`;
        if (msg.type === 'image') {
            md += `![Generated Image](${msg.content})\n\n`;
        } else {
            // Basic code block detection
            if (msg.content.includes('```')) {
                md += `${msg.content}\n\n`;
            } else {
                md += `${msg.content.replace(/\n/g, '  \n')}\n\n`;
            }
        }
    });
    return md;
}

// ---------- Chat UI Management ----------
function addMessage(content, role, type = 'text', animate = true, timestamp = Date.now()) {
    if (welcomeMessage) welcomeMessage.classList.add('hidden');
    if (chatHistory) chatHistory.classList.remove('hidden');

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('flex', 'w-full', 'fade-in');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('msg', 'relative');
    
    // NEW FEATURE: Text-to-Speech Button
    const speakButton = document.createElement('button');
    speakButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>`;
    speakButton.classList.add('absolute', '-top-2', '-right-2', 'p-1', 'rounded-full', 'bg-white/20', 'text-gray-600', 'dark:text-gray-300', 'hover:bg-white/40', 'transition-all', 'opacity-0', 'group-hover:opacity-100');
    speakButton.setAttribute('aria-label', 'Read message aloud');
    speakButton.onclick = (e) => {
        e.stopPropagation();
        speakText(content);
    };

    if (role === 'user') {
        messageWrapper.classList.add('justify-end');
        messageContent.classList.add('msg-user');
    } else {
        messageWrapper.classList.add('justify-start');
        messageContent.classList.add('msg-assistant', 'group'); // Add group for hover
    }

    if (type === 'image') {
        const img = document.createElement('img');
        img.src = content;
        img.alt = 'Generated image';
        img.classList.add('rounded-lg', 'max-w-xs', 'md:max-w-md', 'shadow-lg');
        messageContent.appendChild(img);
    } else {
        messageContent.textContent = content; // Using textContent to prevent XSS
    }
    
    const time = document.createElement('div');
    time.textContent = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    time.classList.add('timestamp', 'text-xs', 'text-gray-500', 'dark:text-gray-400', 'mt-2');
    
    if (role === 'user') {
        time.classList.add('text-right');
    } else {
        time.classList.add('text-left');
        if (type === 'text') {
             messageContent.appendChild(speakButton);
        }
    }

    messageWrapper.appendChild(messageContent);
    chatHistory.appendChild(messageWrapper);
    
    // Append timestamp *after* the message bubble, aligned correctly
    const timestampWrapper = document.createElement('div');
    timestampWrapper.classList.add('w-full', 'flex', 'px-2', 'fade-in');
    if (role === 'user') {
        timestampWrapper.classList.add('justify-end');
    } else {
        timestampWrapper.classList.add('justify-start');
    }
    timestampWrapper.appendChild(time);
    chatHistory.appendChild(timestampWrapper);

    // Scroll to bottom
    requestAnimationFrame(() => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });

    if (animate) {
        // Simple animation, can be enhanced
        messageWrapper.style.animation = 'fadeIn 0.3s ease-out';
        timestampWrapper.style.animation = 'fadeIn 0.3s ease-out';
    }
    
    return messageWrapper;
}

// NEW FEATURE: Typing Indicator
function showTypingIndicator() {
    if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.classList.add('flex', 'w-full', 'justify-start', 'fade-in', 'p-4');
        typingIndicator.innerHTML = `
            <div class="msg msg-assistant" style="padding: 12px 20px;">
                <div class="flex space-x-1.5">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
                </div>
            </div>
        `;
        // Add bounce keyframes to head if not present
        if (!document.getElementById('anim-bounce')) {
            const style = document.createElement('style');
            style.id = 'anim-bounce';
            style.innerHTML = `
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-bounce { animation: bounce 1s infinite ease-in-out; }
            `;
            document.head.appendChild(style);
        }
    }
    chatHistory.appendChild(typingIndicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function hideTypingIndicator() {
    if (typingIndicator && typingIndicator.parentNode === chatHistory) {
        chatHistory.removeChild(typingIndicator);
    }
}

// ---------- API Communication ----------
async function getAIResponse(messages, model, retryCount = 0) {
    // NEW FEATURE: Offline Check
    if (isOffline()) {
        throw new Error("You are offline. Please check your internet connection.");
    }
    
    // NEW FEATURE: Prepend Memory and Persona
    const systemPrompt = `
        ${getPersonaPrompt()}
        
        Here are some facts you should remember about me:
        ${getUserFacts()}
        
        Now, please respond to the following conversation.
    `.trim();

    const messagesWithContext = [
        { role: "system", content: systemPrompt },
        ...messages
    ];
    
    const requestBody = {
        model: model,
        messages: messagesWithContext,
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);

    try {
        const response = await fetch(config.textApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'Referer': config.referrer,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`APIError: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        
        // Handle different possible response structures
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else if (data.text) {
            return data.text;
        } else {
            throw new Error("Invalid API response structure.");
        }

    } catch (error) {
        clearTimeout(timeoutId);
        
        // NEW FEATURE: Smart Retry System
        if (retryCount < config.maxRetries && error.name !== 'AbortError') {
            console.warn(`Request failed, retrying... (${retryCount + 1}/${config.maxRetries})`);
            await new Promise(res => setTimeout(res, 1000)); // Wait 1s before retry
            return getAIResponse(messages, model, retryCount + 1);
        }

        console.error('Error fetching AI response:', error);
        if (error.name === 'AbortError') {
            throw new Error('The request timed out. Please try again.');
        }
        throw error;
    }
}

async function getImageResponse(prompt) {
    if (isOffline()) {
        throw new Error("You are offline. Please check your internet connection.");
    }

    const url = `${config.imageApiUrl}${encodeURIComponent(prompt)}`;
    // We expect the URL itself to be the image source, as per Pollinations.
    // No fetch needed, just return the URL.
    
    // Let's add a check to see if the image loads, otherwise return an error.
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to generate or load image.'));
        img.src = url;
    });
}

// ---------- Command Handling ----------
// NEW FEATURE: Command System
async function handleCommand(message) {
    const parts = message.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
        case '/image':
            addMessage(message, 'user');
            await handleImageGeneration(args);
            return true; // Command was handled

        case '/remember':
            const fact = args.trim();
            if (!fact) {
                addMessage("Usage: /remember [fact about you]", 'assistant', 'text', true);
                return true;
            }
            saveUserFact(fact);
            addMessage(`Got it. I'll remember that: "${fact}"`, 'assistant', 'text', true);
            return true;

        case '/whoami':
        case '/memory':
            const facts = getUserFacts();
            const response = facts ? `Here's what I remember about you:\n\n${facts}` : "I don't have any facts stored for you yet. Use `/remember [fact]` to teach me.";
            addMessage(response, 'assistant', 'text', true);
            return true;
        
        case '/clearcache':
            localStorage.removeItem('apiCache');
            addMessage("API cache cleared.", 'assistant', 'text', true);
            return true;

        case '/summarize':
            addMessage(message, 'user');
            await handleSummarizeChat();
            return true;

        case '/rewrite':
            const [tone, ...textToRewrite] = args.split(' ');
            const text = textToRewrite.join(' ');
            if (!tone || !text) {
                addMessage("Usage: /rewrite [tone] [text to rewrite]\nExample: /rewrite professional I can't do this", 'assistant', 'text', true);
                return true;
            }
            addMessage(message, 'user');
            await handleRewriteText(tone, text);
            return true;

        case '/research':
            if (!args) {
                addMessage("Usage: /research [topic]", 'assistant', 'text', true);
                return true;
            }
            const researchPrompt = `Please conduct research on the following topic: "${args}". Provide a structured answer, including a summary, key points, and any relevant sources you can find.`;
            // This is now a regular prompt, so we return false to let the normal flow handle it.
            // We just modified the user's message.
            chatInput.value = researchPrompt;
            return false; // Let the normal message handler send this
        
        case '/theme':
            const color = args.trim().toLowerCase();
            if (!color) {
                addMessage("Usage: /theme [color name or hex code]\nExample: /theme purple  (or /theme #8b5cf6)", 'assistant', 'text', true);
                return true;
            }
            applyTheme(color);
            addMessage(`Theme accent color changed to ${color}.`, 'assistant', 'text', true);
            return true;

        case '/persona':
            const persona = args.trim();
            if (!persona) {
                addMessage(`Persona cleared. I'm back to my default self.`, 'assistant', 'text', true);
                savePersona('');
                return true;
            }
            savePersona(persona);
            addMessage(`Understood. I will now act as a: "${persona}"`, 'assistant', 'text', true);
            return true;

        case '/help':
            const helpText = `
Available Commands:
- /help: Shows this message.
- /image [prompt]: Generates an image.
- /summarize: Summarizes the current chat.
- /rewrite [tone] [text]: Rewrites your text in a new tone.
- /research [topic]: Performs in-depth research on a topic.
- /remember [fact]: Stores a fact about you.
- /whoami: Retrieves your stored facts.
- /persona [description]: Sets the AI's personality (e.g., "sarcastic friend"). Leave blank to clear.
- /theme [color]: Changes the UI accent color (e.g., 'green', '#FF5733').
- /clearcache: Clears cached API responses.
            `;
            addMessage(helpText.trim(), 'assistant', 'text', true);
            return true;
    }
    
    return false; // Not a command
}

async function handleImageGeneration(prompt) {
    if (!prompt) {
        addMessage('Please provide a prompt for the image. \nExample: `/image a cat wearing a hat`', 'assistant', 'text', true);
        return;
    }
    
    showTypingIndicator();
    try {
        const imageUrl = await getImageResponse(prompt);
        addMessage(imageUrl, 'assistant', 'image', true);
        saveMessageToHistory(imageUrl, 'assistant', 'image');
    } catch (error) {
        console.error('Image generation error:', error);
        showErrorNotification(error.message || 'Failed to generate image.');
    } finally {
        hideTypingIndicator();
    }
}

async function handleSummarizeChat() {
    const chatData = allChats[currentChatId];
    if (!chatData || !chatData.messages.length) {
        addMessage("There's nothing to summarize yet.", 'assistant', 'text', true);
        return;
    }

    const currentModel = modelSelector.value;
    const historyText = chatData.messages
        .filter(m => m.type === 'text')
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
    
    const prompt = `Please summarize the following conversation:\n\n${historyText}`;
    
    showTypingIndicator();
    try {
        const summary = await getAIResponse([{ role: 'user', content: prompt }], currentModel);
        addMessage(summary, 'assistant', 'text', true);
        // Don't save this summary request to history, but DO save the response.
        saveMessageToHistory(summary, 'assistant', 'text');
    } catch (error) {
        console.error('Summarize error:', error);
        showErrorNotification(error.message || 'Failed to summarize chat.');
    } finally {
        hideTypingIndicator();
    }
}

async function handleRewriteText(tone, text) {
    const currentModel = modelSelector.value;
    const prompt = `Rewrite the following text in a "${tone}" tone:\n\nText: "${text}"`;
    
    showTypingIndicator();
    try {
        const rewrittenText = await getAIResponse([{ role: 'user', content: prompt }], currentModel);
        addMessage(rewrittenText, 'assistant', 'text', true);
        // Don't save the rewrite request, but save the response
        saveMessageToHistory(rewrittenText, 'assistant', 'text');
    } catch (error) {
        console.error('Rewrite error:', error);
        showErrorNotification(error.message || 'Failed to rewrite text.');
    } finally {
        hideTypingIndicator();
    }
}

// ---------- Memory System ----------
// NEW FEATURE: Memory
function saveUserFact(fact) {
    let facts = JSON.parse(localStorage.getItem('prismUserFacts') || '[]');
    facts.push({ id: generateChatId(), text: fact });
    localStorage.setItem('prismUserFacts', JSON.stringify(facts));
}

function getUserFacts() {
    let facts = JSON.parse(localStorage.getItem('prismUserFacts') || '[]');
    return facts.map(f => `- ${f.text}`).join('\n');
}

// NEW FEATURE: Personas
function savePersona(persona) {
    if (persona) {
        localStorage.setItem('prismPersona', persona);
    } else {
        localStorage.removeItem('prismPersona');
    }
}

function getPersonaPrompt() {
    return localStorage.getItem('prismPersona') || 'You are PrismAI, a helpful and friendly AI assistant.';
}


// ---------- Voice System ----------
// NEW FEATURE: Speech-to-Text
function initializeSpeechRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        console.warn('Speech Recognition not supported by this browser.');
        return;
    }
    
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.lang = 'en-US';
    speechRecognition.interimResults = true;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = () => {
        isRecognizingSpeech = true;
        micButton.classList.add('bg-red-500', 'text-white');
        micButton.classList.remove('text-gray-500', 'dark:text-gray-400');
        chatInput.placeholder = 'Listening...';
    };

    speechRecognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        chatInput.value = finalTranscript || interimTranscript;
    };

    speechRecognition.onend = () => {
        isRecognizingSpeech = false;
        micButton.classList.remove('bg-red-500', 'text-white');
        micButton.classList.add('text-gray-500', 'dark:text-gray-400');
        chatInput.placeholder = 'Message PrismAI ✨...';
        if (chatInput.value.trim()) {
            chatForm.dispatchEvent(new Event('submit', { bubbles: true }));
        }
    };

    speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showErrorNotification(`Speech error: ${event.error}`);
        isRecognizingSpeech = false;
    };
}

function toggleSpeechRecognition() {
    if (!speechRecognition) {
        showErrorNotification('Speech recognition is not supported in your browser.');
        return;
    }
    if (isRecognizingSpeech) {
        speechRecognition.stop();
    } else {
        speechRecognition.start();
    }
}

// NEW FEATURE: Text-to-Speech
function speakText(text) {
    if (!window.speechSynthesis) {
        showErrorNotification('Text-to-speech is not supported in your browser.');
        return;
    }
    // Stop any previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// ---------- Theme System ----------
// NEW FEATURE: Customizable Themes
function applyTheme(color) {
    // Simple check for hex or named color
    const isValidColor = CSS.supports('color', color);
    if (!isValidColor) {
        showErrorNotification(`Invalid color: ${color}`);
        return;
    }
    
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('prismTheme', color);

    // Update user message bubble CSS
    updateThemeStyles(color);
}

function updateThemeStyles(color) {
    let styleTag = document.getElementById('prism-theme-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'prism-theme-styles';
        document.head.appendChild(styleTag);
    }
    
    // This is a bit of a hack. Ideally, Tailwind would be configured to use this.
    // For now, we manually override the user message and buttons.
    styleTag.innerHTML = `
        .msg-user {
            background: linear-gradient(180deg, ${color}, ${color}d0);
            box-shadow: 0 4px 16px ${color}30;
        }
        .sidebar-button, .send-button {
            background: linear-gradient(90deg, ${color}, ${color}d0);
        }
        .sidebar-button:hover, .send-button:hover {
            background: linear-gradient(90deg, ${color}d0, ${color}b0);
        }
        .chat-history-item.bg-blue-500\\/20 {
            background-color: ${color}30; /* 30 = ~20% opacity */
        }
        .chat-history-item.text-blue-400 {
            color: ${color};
        }
    `;
}

function loadTheme() {
    const savedTheme = localStorage.getItem('prismTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('#3b82f6'); // Default blue
    }
}

// ---------- Chat Logic ----------
function saveMessageToHistory(content, role, type = 'text') {
    if (!currentChatId || !allChats[currentChatId]) {
        console.warn('Cannot save message, no active chat.');
        return;
    }
    
    const message = {
        role: role,
        content: content,
        type: type,
        timestamp: Date.now(),
    };
    
    allChats[currentChatId].messages.push(message);
    
    // Update title
    if (allChats[currentChatId].messages.length === 1 && role === 'user') {
        const newTitle = content.length > 30 ? content.slice(0, 27) + '...' : content;
        allChats[currentChatId].title = newTitle;
        updateChatButtonTitle(currentChatId, newTitle);
    }
    
    saveAllChats();
}

async function handleChatSubmit(event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    
    if (!message) return;
    if (!validateInput(message)) return;

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto'; // Reset height
    
    // NEW FEATURE: Command Handling
    const isCommand = await handleCommand(message);
    if (isCommand) {
        return; // Command was handled, stop processing.
    }
    
    // Add user message to UI and history
    addMessage(message, 'user');
    saveMessageToHistory(message, 'user', 'text');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const currentModel = modelSelector.value;
        const chatData = allChats[currentChatId];
        
        // Get relevant history
        const historyForApi = chatData.messages
            .filter(m => m.type === 'text') // Only send text messages
            .slice(-10) // Get last 10 messages
            .map(m => ({ role: m.role, content: m.content }));
        
        const aiResponse = await getAIResponse(historyForApi, currentModel);
        
        hideTypingIndicator();
        addMessage(aiResponse, 'assistant', 'text', true);
        saveMessageToHistory(aiResponse, 'assistant', 'text');
        
        // Cache this response
        cacheResponse(message, aiResponse);
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Error in chat submit:', error);
        showErrorNotification(error.message || 'An unknown error occurred.');
    }
}

// ---------- Model Selector ----------
function populateModelSelector() {
    // NEW FEATURE: Model Grouping
    // Mock model list, replace with actual API call if available
    const modelGroups = {
        "Chat (Recommended)": [
            { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Smart)" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
        ],
        "Creative & Advanced": [
            { id: "gpt-4", name: "GPT-4 (Powerful)" },
            { id: "claude-3-opus", name: "Claude 3 Opus" },
        ],
        "Fast & Light": [
            { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
            { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
            { id: "claude-3-haiku", name: "Claude 3 Haiku (Fastest)" },
        ],
    };
    
    modelSelector.innerHTML = ''; // Clear "Loading..."

    Object.keys(modelGroups).forEach(groupName => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = groupName;
        
        modelGroups[groupName].forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            optgroup.appendChild(option);
        });
        
        modelSelector.appendChild(optgroup);
    });

    // Set default
    modelSelector.value = "gpt-4o-mini";
}

// ---------- Dynamic UI Injection ----------
// NEW FEATURE: Inject Mic Button
function injectMicButton() {
    micButton = document.createElement('button');
    micButton.type = 'button';
    micButton.id = 'mic-button';
    micButton.classList.add('p-3', 'rounded-full', 'text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-700', 'transition-all', 'absolute', 'right-20', 'bottom-8');
    micButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 1 0-12 0v1.5a6 6 0 0 0 6 6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`;
    micButton.setAttribute('aria-label', 'Use voice input');
    
    // Adjust input padding to make space
    chatInput.classList.add('pr-16');

    // Add click listener
    micButton.addEventListener('click', toggleSpeechRecognition);
    
    // Insert into the form
    chatForm.classList.add('relative');
    chatForm.appendChild(micButton);
}

// NEW FEATURE: Inject Quick Actions
function injectQuickActions() {
    quickActionsBar = document.createElement('div');
    quickActionsBar.id = 'quick-actions';
    quickActionsBar.classList.add('flex', 'flex-wrap', 'gap-2', 'p-2', 'pb-0', 'absolute', '-top-12', 'left-0', 'w-full');
    
    const actions = [
        { label: 'Image', command: '/image ' },
        { label: 'Summarize', command: '/summarize' },
        { label: 'Rewrite', command: '/rewrite ' },
        { label: 'Help', command: '/help' }
    ];
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.classList.add('px-3', 'py-1.5', 'text-sm', 'font-medium', 'rounded-full', 'bg-white/20', 'dark:bg-gray-700/30', 'text-gray-700', 'dark:text-gray-200', 'hover:bg-white/40', 'dark:hover:bg-gray-600/50', 'transition-all');
        button.onclick = () => {
            chatInput.value = action.command;
            chatInput.focus();
        };
        quickActionsBar.appendChild(button);
    });
    
    // Find the wrapper and make it relative to position the bar
    const inputWrapper = chatForm.parentElement;
    if (inputWrapper) {
        inputWrapper.classList.add('relative');
        inputWrapper.style.paddingTop = '3rem'; // Add space for the bar
        inputWrapper.prepend(quickActionsBar);
    }
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    // Dark Mode
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.documentElement.classList.add('dark');
    }
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
    });

    // Chat
    chatForm.addEventListener('submit', handleChatSubmit);
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit', { bubbles: true }));
        }
    });

    // Sidebar
    newChatBtn.addEventListener('click', () => selectChat(null));
    exportChatBtn.addEventListener('click', exportChat);
    
    // Sidebar chat history clicks
    chatHistoryList.addEventListener('click', (e) => {
        const button = e.target.closest('.chat-history-item');
        if (button) {
            const chatId = button.dataset.chatId;
            if (chatId) {
                selectChat(chatId);
            }
        }
    });

    // Error close button
    document.getElementById('close-error').addEventListener('click', () => {
        document.getElementById('error-notification').classList.add('hidden');
    });

    // Tutorial (assuming it's still present in HTML)
    const tutorial = document.getElementById('tutorial-overlay');
    const closeTutorialBtn = document.getElementById('tutorial-close-btn');
    const doneTutorialBtn = document.getElementById('tutorial-done-btn');
    const hasSeenTutorial = localStorage.getItem('hasSeenPrismTutorial');

    if (!hasSeenTutorial && tutorial) {
        tutorial.classList.add('visible');
    }
    
    const closeTutorial = () => {
        if (tutorial) tutorial.classList.remove('visible');
        localStorage.setItem('hasSeenPrismTutorial', 'true');
    };
    
    if (closeTutorialBtn) closeTutorialBtn.addEventListener('click', closeTutorial);
    if (doneTutorialBtn) doneTutorialBtn.addEventListener('click', closeTutorial);

    // --- Initialize New Features ---
    loadTheme();
    loadAllChats();
    populateModelSelector();
    
    // Inject dynamic UI
    injectMicButton();
    injectQuickActions();
    
    // Init speech
    initializeSpeechRecognition();
});
