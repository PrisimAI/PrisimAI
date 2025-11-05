* PrismAI Chat Script - Fixed & Optimized Version
 * 
 * FIXES APPLIED:
 * ✅ Updated API endpoints to enter.pollinations.ai
 * ✅ Fixed API key and authentication
 * ✅ Fixed model loading from correct endpoint
 * ✅ Fixed image generation endpoint
 * ✅ Improved error handling and user feedback
 * ✅ Optimized code structure and removed redundancies
 * ✅ Fixed mobile responsiveness issues
 * ✅ Enhanced dark mode transitions
 * ✅ Fixed localStorage quota issues
 * ✅ Improved plugin system reliability
 */

(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, \"clarity\", \"script\", \"tm2922ucwi\");

// ---------- Configuration ----------
const config = {
    apiKey: 'pk_3GhuMhutfgfIa5NsmkI92G',
    textApiUrl: 'https://enter.pollinations.ai/api/generate/openai',
    imageApiUrl: 'https://enter.pollinations.ai/api/generate/image',
    modelsApiUrl: 'https://enter.pollinations.ai/api/generate/openai/models',
    imageModelsApiUrl: 'https://enter.pollinations.ai/api/generate/image/models',
    dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    requestTimeout: 30000,
    maxMessageLength: 1000,
    cacheExpiration: 24 * 60 * 60 * 1000,
    messagesPerPage: 20,
    maxRetries: 1,
};

// ---------- DOM Refs ----------
const dom = {
    sidebar: document.getElementById('sidebar'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    chatHistory: document.getElementById('chat-history'),
    chatInput: document.getElementById('chat-input'),
    chatForm: document.getElementById('chat-form'),
    welcomeMessage: document.getElementById('welcome-message'),
    welcomeUserName: document.getElementById('welcome-user-name'),
    newChatBtn: document.getElementById('new-chat-btn'),
    exportChatBtn: document.getElementById('export-chat-btn'),
    modelSelector: document.getElementById('model-selector'),
    chatHistoryListContainer: document.getElementById('chat-history-list-container'),
    chatHistoryList: document.getElementById('chat-history-list'),
    chatHistoryTab: document.getElementById('chat-history-tab'),
    galleryTab: document.getElementById('gallery-tab'),
    imageGalleryPanel: document.getElementById('image-gallery-panel'),
    imageGalleryGrid: document.getElementById('image-gallery-grid'),
    imageGalleryPlaceholder: document.getElementById('image-gallery-placeholder'),
    profileMenuBtn: document.getElementById('profile-menu-btn'),
    profileMenu: document.getElementById('profile-menu'),
    changeNameBtn: document.getElementById('change-name-btn'),
    userName: document.getElementById('user-name'),
    offlineIndicator: document.getElementById('offline-indicator'),
    promptTemplatesBar: document.getElementById('prompt-templates-bar'),
    tutorialOverlay: document.getElementById('tutorial-overlay'),
    tutorialCloseBtn: document.getElementById('tutorial-close-btn'),
    tutorialDoneBtn: document.getElementById('tutorial-done-btn'),
    errorNotification: document.getElementById('error-notification'),
    errorMessage: document.getElementById('error-message'),
    closeErrorBtn: document.getElementById('close-error'),
};

// ---------- State ----------
let currentChatId = null;
let allChats = {};
let isRecognizingSpeech = false;
let speechRecognition;
let typingIndicator;
let micButton;
let currentImageModel = null;

// ---------- Helper Functions ----------
function generateChatId() {
    return Date.now().toString(36) + \"-\" + Math.random().toString(36).slice(2, 8);
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function isOffline() {
    return !navigator.onLine;
}

// ---------- Error Notification ----------
function showErrorNotification(message) {
    if (dom.errorNotification && dom.errorMessage) {
        dom.errorMessage.textContent = message;
        dom.errorNotification.classList.remove('hidden');
        dom.errorNotification.style.opacity = '1';
        setTimeout(() => {
            dom.errorNotification.style.opacity = '0';
            setTimeout(() => dom.errorNotification.classList.add('hidden'), 300);
        }, 5000);
    }
}

function showSuccessNotification(message) {
    // Reuse error notification but with green styling
    if (dom.errorNotification && dom.errorMessage) {
        dom.errorMessage.textContent = message;
        dom.errorNotification.style.background = 'rgba(16, 185, 129, 0.2)';
        dom.errorNotification.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        dom.errorNotification.style.color = '#10b981';
        dom.errorNotification.classList.remove('hidden');
        dom.errorNotification.style.opacity = '1';
        setTimeout(() => {
            dom.errorNotification.style.opacity = '0';
            setTimeout(() => {
                dom.errorNotification.classList.add('hidden');
                // Reset to error styling
                dom.errorNotification.style.background = '';
                dom.errorNotification.style.borderColor = '';
                dom.errorNotification.style.color = '';
            }, 300);
        }, 3000);
    }
}

// ---------- Sidebar & Mobile ----------
function toggleSidebar(forceOpen = null) {
    const isOpen = dom.sidebar.classList.contains('open');
    if (forceOpen === true || (forceOpen === null && !isOpen)) {
        dom.sidebar.classList.add('open');
        document.body.classList.add('sidebar-open');
    } else {
        dom.sidebar.classList.remove('open');
        document.body.classList.remove('sidebar-open');
    }
}

function switchSidebarTab(tabName) {
    if (tabName === 'gallery') {
        dom.chatHistoryTab.classList.remove('active-tab');
        dom.galleryTab.classList.add('active-tab');
        dom.chatHistoryListContainer.classList.add('hidden');
        dom.imageGalleryPanel.classList.remove('hidden');
        renderImageGallery();
    } else {
        dom.galleryTab.classList.remove('active-tab');
        dom.chatHistoryTab.classList.add('active-tab');
        dom.imageGalleryPanel.classList.add('hidden');
        dom.chatHistoryListContainer.classList.remove('hidden');
    }
}

// ---------- Profile & User ----------
function loadUserName() {
    const name = localStorage.getItem('prismUserName') || 'Stranger';
    dom.userName.textContent = name;
    dom.welcomeUserName.textContent = `Hello there, ${name}!`;
}

function changeUserName() {
    const currentName = localStorage.getItem('prismUserName') || 'Stranger';
    const newName = prompt('Enter your name:', currentName);
    if (newName && newName.trim()) {
        localStorage.setItem('prismUserName', newName.trim());
        loadUserName();
        showSuccessNotification('Name updated successfully!');
    }
    dom.profileMenu.classList.add('hidden');
}

// ---------- Image Gallery ----------
function saveImageToGallery(url, prompt) {
    try {
        let gallery = JSON.parse(localStorage.getItem('prismImageGallery') || '[]');
        gallery.unshift({ id: generateChatId(), url, prompt, timestamp: Date.now() });
        // Limit gallery to 50 images to prevent localStorage quota issues
        if (gallery.length > 50) gallery = gallery.slice(0, 50);
        localStorage.setItem('prismImageGallery', JSON.stringify(gallery));
    } catch (e) {
        console.warn('Failed to save image to gallery:', e);
    }
}

function renderImageGallery() {
    let gallery = JSON.parse(localStorage.getItem('prismImageGallery') || '[]');
    dom.imageGalleryGrid.innerHTML = '';
    
    if (gallery.length === 0) {
        dom.imageGalleryPlaceholder.classList.remove('hidden');
        return;
    }
    
    dom.imageGalleryPlaceholder.classList.add('hidden');
    gallery.forEach(item => {
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('gallery-image');
        imgWrapper.title = item.prompt;
        imgWrapper.innerHTML = `<img src=\"${escapeHTML(item.url)}\" alt=\"${escapeHTML(item.prompt)}\" loading=\"lazy\">`;
        imgWrapper.onclick = () => window.open(item.url, '_blank');
        dom.imageGalleryGrid.appendChild(imgWrapper);
    });
}

// ---------- Chat History List ----------
function addChatButton(chatId, title = 'New Chat') {
    const existing = dom.chatHistoryList.querySelector(`[data-chat-id=\"${chatId}\"]`);
    if (existing) return existing;

    const chatButton = document.createElement('button');
    chatButton.className = 'w-full p-3 rounded-xl text-left text-gray-700 dark:text-gray-300 font-medium hover:bg-white/20 transition-all duration-200 active:scale-95 flex items-center space-x-2 chat-history-item';
    chatButton.dataset.chatId = chatId;
    chatButton.setAttribute('aria-label', `Select chat: ${title}`);
    const safeTitle = escapeHTML(title);
    chatButton.innerHTML = `
        <svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-5 h-5 flex-shrink-0\" aria-hidden=\"true\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8 10h.01M12 10h.01M16 10h.01M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z\" />
        </svg>
        <span class=\"truncate\" title=\"${safeTitle}\">${safeTitle}</span>
    `;
    dom.chatHistoryList.prepend(chatButton);
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
    const btn = dom.chatHistoryList.querySelector(`.chat-history-item[data-chat-id=\"${chatId}\"]`);
    if (!btn) return;
    const span = btn.querySelector('span');
    if (span) {
        const safeTitle = escapeHTML(newTitle);
        span.textContent = safeTitle;
        span.title = safeTitle;
        btn.setAttribute('aria-label', `Select chat: ${safeTitle}`);
    }
}

// ---------- Chat Selection & Load ----------
function selectChat(chatId) {
    if (chatId === null || chatId === 'new-chat-placeholder') {
        currentChatId = generateChatId();
        allChats[currentChatId] = { title: 'New Chat', messages: [], createdAt: Date.now() };
        addChatButton(currentChatId, allChats[currentChatId].title);
        setActiveChatButton(currentChatId);
        loadChatMessages([]);
        dom.chatInput.placeholder = 'Message PrismAI ✨...';
        saveAllChats();
        switchSidebarTab('chat');
        toggleSidebar(false);
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
    dom.chatInput.placeholder = `Message ${escapeHTML(chatData.title)}...`;
    saveAllChats();
    switchSidebarTab('chat');
    toggleSidebar(false);
}

function loadChatMessages(messages, start = 0, limit = config.messagesPerPage) {
    dom.chatHistory.innerHTML = '';
    const slicedMessages = messages.slice(start, start + limit);
    if (!slicedMessages.length && messages.length === 0) {
        dom.welcomeMessage.classList.remove('hidden');
        dom.chatHistory.classList.add('hidden');
        return;
    }
    dom.welcomeMessage.classList.add('hidden');
    dom.chatHistory.classList.remove('hidden');

    slicedMessages.forEach(msg => {
        addMessage(msg.content, msg.role, msg.type || 'text', false, msg.timestamp);
    });
}

// ---------- Data Persisting ----------
function saveAllChats() {
    try {
        const chatsToSave = {};
        // Only save last 20 chats to prevent quota issues
        const sortedChats = Object.entries(allChats)
            .sort((a,b) => (b[1]?.createdAt||0) - (a[1]?.createdAt||0))
            .slice(0, 20);
        
        sortedChats.forEach(([id, data]) => {
            chatsToSave[id] = {
                ...data,
                messages: data.messages.slice(-50) // Keep only last 50 messages per chat
            };
        });
        
        localStorage.setItem('allPrisimAIChats', JSON.stringify(chatsToSave));
    } catch (e) {
        console.warn('Could not save chats to localStorage:', e);
        showErrorNotification('Storage full. Try deleting old chats.');
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

function exportChat() {
    if (!currentChatId || !allChats[currentChatId]) {
        showErrorNotification('No chat selected to export.');
        return;
    }
    
    const format = prompt(\"Enter export format: 'json', 'txt', or 'md'\", 'md');
    if (!format || !['json', 'txt', 'md'].includes(format.toLowerCase())) {
        return;
    }
    
    const chatData = allChats[currentChatId];
    let content = '', mimeType = '', fileExt = '';

    switch (format.toLowerCase()) {
        case 'txt':
            content = formatChatAsTxt(chatData); mimeType = 'text/plain'; fileExt = 'txt';
            break;
        case 'md':
            content = formatChatAsMd(chatData); mimeType = 'text/markdown'; fileExt = 'md';
            break;
        default:
            content = JSON.stringify(chatData, null, 2); mimeType = 'application/json'; fileExt = 'json';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrismAI_Chat_${chatData.title.replace(/\\s+/g, '_')}_${currentChatId}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccessNotification('Chat exported successfully!');
}

function formatChatAsTxt(chatData) {
    let text = `Chat Title: ${chatData.title}\
Exported: ${new Date().toLocaleString()}\
\
`;
    chatData.messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        text += `[${time}] ${msg.role === 'user' ? 'You' : 'PrismAI'}:\
${msg.content}\
\
`;
    });
    return text;
}

function formatChatAsMd(chatData) {
    let md = `# Chat: ${chatData.title}\
**Exported:** ${new Date().toLocaleString()}\
\
---\
\
`;
    chatData.messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const sender = msg.role === 'user' ? 'You' : 'PrismAI';
        md += `**${sender}** (*${time}*):\
\
`;
        if (msg.type === 'image') md += `![Generated Image](${msg.content})\
\
`;
        else if (msg.type === 'code') md += `${msg.content}\
\
`;
        else md += `${msg.content.replace(/\
/g, '  \
')}\
\
`;
    });
    return md;
}

// ---------- Chat UI Management ----------
function addMessage(content, role, type = 'text', animate = true, timestamp = Date.now()) {
    dom.welcomeMessage.classList.add('hidden');
    dom.chatHistory.classList.remove('hidden');

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('flex', 'w-full', 'slide-in-up', 'opacity-0');
    if (animate) messageWrapper.style.animationFillMode = 'forwards';
    else messageWrapper.classList.remove('slide-in-up', 'opacity-0');
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('msg', 'relative');
    
    if (role === 'user') {
        messageWrapper.classList.add('justify-end');
        messageContent.classList.add('msg-user');
    } else {
        messageWrapper.classList.add('justify-start');
        messageContent.classList.add('msg-assistant', 'group');
    }

    // --- Render based on type ---
    if (type === 'image') {
        messageContent.innerHTML = `<img src=\"${escapeHTML(content)}\" alt=\"Generated image\" class=\"rounded-lg max-w-xs md:max-w-md shadow-lg\" loading=\"lazy\">`;
    } else if (type === 'calculator' || type === 'dictionary' || type === 'code') {
        messageContent.innerHTML = content;
    } else {
        messageContent.textContent = content;
        if (role === 'assistant') {
            const speakButton = document.createElement('button');
            speakButton.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\" stroke-width=\"1.5\" stroke=\"currentColor\" class=\"w-4 h-4\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z\" /></svg>`;
            speakButton.className = 'absolute -top-2 -right-2 p-1 rounded-full bg-white/20 text-gray-600 dark:text-gray-300 hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100';
            speakButton.setAttribute('aria-label', 'Read message aloud');
            speakButton.onclick = (e) => { e.stopPropagation(); speakText(content); };
            messageContent.appendChild(speakButton);
        }
    }

    const time = document.createElement('div');
    time.textContent = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    time.className = 'timestamp text-xs text-gray-500 dark:text-gray-400 mt-2';
    if (role === 'user') time.classList.add('text-right');
    else time.classList.add('text-left');

    messageWrapper.appendChild(messageContent);
    dom.chatHistory.appendChild(messageWrapper);
    
    const timestampWrapper = document.createElement('div');
    timestampWrapper.className = 'w-full flex px-2 slide-in-up opacity-0';
    if (animate) {
        timestampWrapper.style.animationFillMode = 'forwards';
        timestampWrapper.style.animationDelay = '0.1s';
    } else {
        timestampWrapper.classList.remove('slide-in-up', 'opacity-0');
    }
    if (role === 'user') timestampWrapper.classList.add('justify-end');
    else timestampWrapper.classList.add('justify-start');
    
    timestampWrapper.appendChild(time);
    dom.chatHistory.appendChild(timestampWrapper);

    requestAnimationFrame(() => {
        dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
    });
    
    return messageWrapper;
}

function showTypingIndicator() {
    if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex w-full justify-start slide-in-up opacity-0 p-4';
        typingIndicator.style.animationFillMode = 'forwards';
        typingIndicator.innerHTML = `
            <div class=\"msg msg-assistant\" style=\"padding: 12px 20px;\">
                <div class=\"flex space-x-1.5\">
                    <div class=\"w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot\" style=\"animation-delay: 0s;\"></div>
                    <div class=\"w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot\" style=\"animation-delay: 0.1s;\"></div>
                    <div class=\"w-2 h-2 bg-gray-400 rounded-full animate-bounce-dot\" style=\"animation-delay: 0.2s;\"></div>
                </div>
            </div>
        `;
    }
    dom.chatHistory.appendChild(typingIndicator);
    dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
}

function hideTypingIndicator() {
    if (typingIndicator && typingIndicator.parentNode === dom.chatHistory) {
        typingIndicator.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
                typingIndicator.style.animation = '';
            }
        }, 300);
    }
}

// ---------- API Communication ----------
async function getAIResponse(messages, model, retryCount = 0) {
    if (isOffline()) throw new Error(\"You are offline. Please check your internet connection.\");
    
    const systemPrompt = `${getPersonaPrompt()}\
Here are some facts you should remember about me:\
${getUserFacts()}\
Now, please respond to the following conversation.`.trim();
    const messagesWithContext = [{ role: \"system\", content: systemPrompt }, ...messages];
    const requestBody = { 
        model: model, 
        messages: messagesWithContext,
        stream: false
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);

    try {
        const response = await fetch(config.textApiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        if (data.text) return data.text;
        if (data.response) return data.response;
        
        throw new Error(\"Invalid API response structure.\");
    } catch (error) {
        clearTimeout(timeoutId);
        if (retryCount < config.maxRetries && error.name !== 'AbortError') {
            await new Promise(res => setTimeout(res, 1000));
            return getAIResponse(messages, model, retryCount + 1);
        }
        if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
        throw error;
    }
}

async function getImageResponse(prompt, model = null) {
    if (isOffline()) throw new Error(\"You are offline. Please check your internet connection.\");
    
    try {
        const requestBody = { 
            prompt: prompt,
            model: model || currentImageModel || 'flux',
            width: 1024,
            height: 1024
        };
        
        const response = await fetch(config.imageApiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Image API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response formats
        if (data.url) return data.url;
        if (data.image_url) return data.image_url;
        if (data.images && data.images[0]) return data.images[0];
        
        throw new Error('Invalid image API response');
    } catch (error) {
        console.error('Image generation error:', error);
        throw new Error(`Failed to generate image: ${error.message}`);
    }
}

// ---------- Plugin System & Commands ----------
async function handleCommand(message) {
    const parts = message.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
        case '/image':
            addMessage(message, 'user');
            await handleImageGeneration(args);
            return true;

        case '/remember':
            if (!args) { 
                addMessage(\"Usage: /remember [fact about you]\", 'assistant', 'text', true); 
                return true; 
            }
            saveUserFact(args);
            addMessage(`Got it. I'll remember that: \"${args}\"`, 'assistant', 'text', true);
            return true;
            
        case '/whoami':
        case '/memory':
            const facts = getUserFacts();
            const factResponse = facts ? `Here's what I remember about you:\
\
${facts}` : \"I don't have any facts stored for you yet.\";
            addMessage(factResponse, 'assistant', 'text', true);
            return true;
        
        case '/clearcache':
            localStorage.removeItem('apiCache');
            addMessage(\"API cache cleared.\", 'assistant', 'text', true);
            return true;
            
        case '/theme':
            if (!args) { 
                addMessage(\"Usage: /theme [color name or hex code]\", 'assistant', 'text', true); 
                return true; 
            }
            applyTheme(args);
            addMessage(`Theme accent color changed to ${args}.`, 'assistant', 'text', true);
            return true;
            
        case '/persona':
            savePersona(args);
            const personaMsg = args ? `Understood. I will now act as: \"${args}\"` : `Persona cleared. I'm back to my default self.`;
            addMessage(personaMsg, 'assistant', 'text', true);
            return true;
            
        case '/summarize':
            addMessage(message, 'user');
            await handleSummarizeChat();
            return true;
            
        case '/rewrite':
            const [tone, ...textToRewrite] = args.split(' ');
            if (!tone || !textToRewrite.length) { 
                addMessage(\"Usage: /rewrite [tone] [text to rewrite]\", 'assistant', 'text', true); 
                return true; 
            }
            addMessage(message, 'user');
            await handleRewriteText(tone, textToRewrite.join(' `,
  `language`: `javascript`
}

                                addMessage(message, 'user');
            await handleRewriteText(tone, textToRewrite.join(' '));
            return true;
            
        case '/research':
            if (!args) { 
                addMessage("Usage: /research [topic]", 'assistant', 'text', true); 
                return true; 
            }
            dom.chatInput.value = `Please conduct research on the following topic: "${args}". Provide a structured answer, including a summary, key points, and any relevant sources you can find.`;
            return false;
        
        case '/calc':
            addMessage(message, 'user');
            handleCalculator(args);
            return true;
            
        case '/define':
            addMessage(message, 'user');
            await handleDictionary(args);
            return true;
            
        case '/code':
            const [lang, ...code] = args.split(' ');
            if (!lang || !code.length) { 
                addMessage("Usage: /code [language] [code...]", 'assistant', 'text', true); 
                return true; 
            }
            addMessage(message, 'user');
            handleCodeFormatter(lang, code.join(' '));
            return true;

        case '/help':
            const helpText = `
Available Commands:
- /help: Shows this message.
- /image [prompt]: Generates an image.
- /summarize: Summarizes the current chat.
- /rewrite [tone] [text]: Rewrites your text.
- /research [topic]: Performs in-depth research.
- /remember [fact]: Stores a fact about you.
- /whoami: Retrieves your stored facts.
- /persona [desc]: Sets the AI's personality.
- /theme [color]: Changes the UI accent color.
- /clearcache: Clears cached API responses.

Plugins:
- /calc [expression]: Calculator (e.g., /calc 5 * (10 + 2))
- /define [word]: Dictionary lookup
- /code [lang] [code]: Code formatter
            `;
            addMessage(helpText.trim().replace(/^\s+/gm, ''), 'assistant', 'text', true);
            return true;
    }
    return false;
}

// --- Command Handlers ---
async function handleImageGeneration(prompt) {
    if (!prompt) { 
        addMessage('Usage: `/image [prompt]`', 'assistant', 'text', true); 
        return; 
    }
    showTypingIndicator();
    try {
        const imageUrl = await getImageResponse(prompt);
        hideTypingIndicator();
        addMessage(imageUrl, 'assistant', 'image', true);
        saveMessageToHistory(imageUrl, 'assistant', 'image');
        saveImageToGallery(imageUrl, prompt);
        showSuccessNotification('Image generated successfully!');
    } catch (error) {
        hideTypingIndicator();
        console.error('Image generation error:', error);
        showErrorNotification(error.message || 'Failed to generate image.');
    }
}

async function handleSummarizeChat() {
    const chatData = allChats[currentChatId];
    if (!chatData || !chatData.messages.length) { 
        addMessage("There's nothing to summarize yet.", 'assistant', 'text', true); 
        return; 
    }
    const historyText = chatData.messages
        .filter(m => m.type === 'text')
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
    const prompt = `Please summarize the following conversation:\n\n${historyText}`;
    showTypingIndicator();
    try {
        const summary = await getAIResponse([{ role: 'user', content: prompt }], dom.modelSelector.value);
        hideTypingIndicator();
        addMessage(summary, 'assistant', 'text', true);
        saveMessageToHistory(summary, 'assistant', 'text');
    } catch (error) {
        hideTypingIndicator();
        showErrorNotification(error.message || 'Failed to summarize chat.');
    }
}

async function handleRewriteText(tone, text) {
    const prompt = `Rewrite the following text in a "${tone}" tone:\n\nText: "${text}"`;
    showTypingIndicator();
    try {
        const rewrittenText = await getAIResponse([{ role: 'user', content: prompt }], dom.modelSelector.value);
        hideTypingIndicator();
        addMessage(rewrittenText, 'assistant', 'text', true);
        saveMessageToHistory(rewrittenText, 'assistant', 'text');
    } catch (error) {
        hideTypingIndicator();
        showErrorNotification(error.message || 'Failed to rewrite text.');
    }
}

// --- Plugin Handlers ---
function handleCalculator(expression) {
    if (!expression) { 
        addMessage('Usage: /calc [mathematical expression]', 'assistant', 'text', true); 
        return; 
    }
    try {
        if (/[^0-9\s\.\+\-\*\/\(\)]/g.test(expression)) {
            throw new Error('Invalid characters. Only numbers and operators are allowed.');
        }
        const result = new Function(`return ${expression}`)();
        const html = `
            <div class="plugin-container">
                <div class="calc-expression">${escapeHTML(expression)}</div>
                <div class="calc-result">${result}</div>
            </div>
        `;
        addMessage(html, 'assistant', 'calculator', true);
        saveMessageToHistory(html, 'assistant', 'calculator');
    } catch (error) {
        addMessage(`Error: ${error.message}`, 'assistant', 'text', true);
    }
}

async function handleDictionary(word) {
    if (!word) { 
        addMessage('Usage: /define [word]', 'assistant', 'text', true); 
        return; 
    }
    showTypingIndicator();
    try {
        const response = await fetch(`${config.dictionaryApiUrl}${encodeURIComponent(word)}`);
        if (!response.ok) throw new Error('Could not find definition.');
        const data = await response.json();
        
        const entry = data[0];
        const phonetic = entry.phonetics.find(p => p.text)?.text || 'N/A';
        const definition = entry.meanings[0]?.definitions[0]?.definition || 'No definition found.';
        
        const html = `
            <div class="plugin-container">
                <div class="dict-word">${escapeHTML(entry.word)}</div>
                <div class="dict-phonetic">${escapeHTML(phonetic)}</div>
                <div class="dict-definition">${escapeHTML(definition)}</div>
            </div>
        `;
        hideTypingIndicator();
        addMessage(html, 'assistant', 'dictionary', true);
        saveMessageToHistory(html, 'assistant', 'dictionary');
    } catch (error) {
        hideTypingIndicator();
        showErrorNotification(error.message || `Could not define "${word}".`);
    }
}

function handleCodeFormatter(lang, code) {
    const html = `
        <div class="code-block">
            <pre><code class="language-${escapeHTML(lang)}">${escapeHTML(code)}</code></pre>
        </div>
    `;
    addMessage(html, 'assistant', 'code', true);
    saveMessageToHistory(html, 'assistant', 'code');
}

// ---------- Memory System ----------
function saveUserFact(fact) {
    try {
        let facts = JSON.parse(localStorage.getItem('prismUserFacts') || '[]');
        facts.push({ id: generateChatId(), text: fact });
        // Limit to 20 facts
        if (facts.length > 20) facts = facts.slice(-20);
        localStorage.setItem('prismUserFacts', JSON.stringify(facts));
    } catch (e) {
        console.warn('Failed to save user fact:', e);
    }
}

function getUserFacts() {
    try {
        let facts = JSON.parse(localStorage.getItem('prismUserFacts') || '[]');
        return facts.map(f => `- ${f.text}`).join('\n');
    } catch (e) {
        return '';
    }
}

function savePersona(persona) {
    if (persona) localStorage.setItem('prismPersona', persona);
    else localStorage.removeItem('prismPersona');
}

function getPersonaPrompt() {
    return localStorage.getItem('prismPersona') || 'You are PrismAI, a helpful and friendly AI assistant.';
}

// ---------- Voice System ----------
function initializeSpeechRecognition() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) { 
        console.warn('Speech Recognition not supported.'); 
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
        dom.chatInput.placeholder = 'Listening...';
    };

    speechRecognition.onresult = (event) => {
        let transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        dom.chatInput.value = transcript;
        dom.chatInput.style.height = 'auto';
        dom.chatInput.style.height = (dom.chatInput.scrollHeight) + 'px';
    };

    speechRecognition.onend = () => {
        isRecognizingSpeech = false;
        micButton.classList.remove('bg-red-500', 'text-white');
        micButton.classList.add('text-gray-500', 'dark:text-gray-400');
        dom.chatInput.placeholder = 'Message PrismAI ✨...';
        if (dom.chatInput.value.trim()) {
            dom.chatForm.dispatchEvent(new Event('submit', { bubbles: true }));
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
        showErrorNotification('Speech recognition is not supported.'); 
        return; 
    }
    if (isRecognizingSpeech) speechRecognition.stop();
    else speechRecognition.start();
}

function speakText(text) {
    if (!window.speechSynthesis) { 
        showErrorNotification('Text-to-speech is not supported.'); 
        return; 
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// ---------- Theme System ----------
function applyTheme(color) {
    if (!CSS.supports('color', color)) { 
        showErrorNotification(`Invalid color: ${color}`); 
        return; 
    }
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('prismTheme', color);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('prismTheme') || '#3b82f6';
    applyTheme(savedTheme);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// ---------- Chat Logic ----------
function saveMessageToHistory(content, role, type = 'text') {
    if (!currentChatId || !allChats[currentChatId]) return;
    const message = { role, content, type, timestamp: Date.now() };
    allChats[currentChatId].messages.push(message);
    if (allChats[currentChatId].messages.length === 1 && role === 'user') {
        const newTitle = content.length > 30 ? content.slice(0, 27) + '...' : content;
        allChats[currentChatId].title = newTitle;
        updateChatButtonTitle(currentChatId, newTitle);
    }
    saveAllChats();
}

async function handleChatSubmit(event) {
    event.preventDefault();
    if (isOffline()) { 
        showErrorNotification('You are offline. Please check your connection.'); 
        return; 
    }
    
    const message = dom.chatInput.value.trim();
    if (!message) return;
    
    dom.chatInput.value = '';
    dom.chatInput.style.height = 'auto';
    
    const isCommand = await handleCommand(message);
    if (isCommand) return;
    
    addMessage(message, 'user');
    saveMessageToHistory(message, 'user', 'text');
    showTypingIndicator();
    
    try {
        const chatData = allChats[currentChatId];
        const historyForApi = chatData.messages
            .filter(m => m.type === 'text')
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content }));
        const aiResponse = await getAIResponse(historyForApi, dom.modelSelector.value);
        hideTypingIndicator();
        addMessage(aiResponse, 'assistant', 'text', true);
        saveMessageToHistory(aiResponse, 'assistant', 'text');
    } catch (error) {
        hideTypingIndicator();
        console.error('Chat error:', error);
        showErrorNotification(error.message || 'An unknown error occurred.');
    }
}

async function populateModelSelector() {
    dom.modelSelector.innerHTML = '<option value="" disabled>Loading models...</option>';

    try {
        const response = await fetch(config.modelsApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load models: ${response.status}`);
        }
        
        const data = await response.json();
        dom.modelSelector.innerHTML = '';
        
        if (data.data && Array.isArray(data.data)) {
            // Group models by category
            const modelGroups = {
                'OpenAI Models': [],
                'Anthropic Models': [],
                'Google Models': [],
                'Meta Models': [],
                'Mistral Models': [],
                'Other Models': []
            };
            
            data.data.forEach(model => {
                const modelId = model.id || model.name || model;
                if (typeof modelId !== 'string') return;
                
                if (modelId.includes('openai') || modelId.includes('gpt')) {
                    modelGroups['OpenAI Models'].push(modelId);
                } else if (modelId.includes('claude') || modelId.includes('anthropic')) {
                    modelGroups['Anthropic Models'].push(modelId);
                } else if (modelId.includes('gemini') || modelId.includes('google')) {
                    modelGroups['Google Models'].push(modelId);
                } else if (modelId.includes('llama') || modelId.includes('meta')) {
                    modelGroups['Meta Models'].push(modelId);
                } else if (modelId.includes('mistral')) {
                    modelGroups['Mistral Models'].push(modelId);
                } else {
                    modelGroups['Other Models'].push(modelId);
                }
            });
            
            // Add optgroups with models
            Object.entries(modelGroups).forEach(([groupName, models]) => {
                if (models.length > 0) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = groupName;
                    
                    models.forEach(modelId => {
                        const option = document.createElement('option');
                        option.value = modelId;
                        option.textContent = modelId;
                        optgroup.appendChild(option);
                    });
                    
                    dom.modelSelector.appendChild(optgroup);
                }
            });
            
            // Set default selection
            if (dom.modelSelector.options.length > 0) {
                dom.modelSelector.selectedIndex = 0;
            }
        } else {
            throw new Error('Invalid models response format');
        }
    } catch (error) {
        console.error('Failed to load models:', error);
        dom.modelSelector.innerHTML = '<option value="openai">openai (default)</option>';
        showErrorNotification('Failed to load models. Using default.');
    }
}

async function loadImageModels() {
    try {
        const response = await fetch(config.imageModelsApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                currentImageModel = data.data[0].id || data.data[0].name || data.data[0];
            }
        }
    } catch (error) {
        console.warn('Could not load image models:', error);
    }
}

// ---------- Dynamic UI Injection ----------
function injectMicButton() {
    micButton = document.createElement('button');
    micButton.type = 'button';
    micButton.id = 'mic-button';
    micButton.className = 'p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all absolute right-20 bottom-8';
    micButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>`;
    micButton.setAttribute('aria-label', 'Use voice input');
    dom.chatInput.classList.add('pr-16');
    micButton.addEventListener('click', toggleSpeechRecognition);
    dom.chatForm.classList.add('relative');
    dom.chatForm.appendChild(micButton);
}

function injectQuickActions() {
    const inputWrapper = dom.chatForm.parentElement;
    if (!inputWrapper) return;
    
    const quickActionsBar = document.createElement('div');
    quickActionsBar.className = 'flex flex-wrap gap-2 p-2 pb-0 absolute -top-12 left-0 w-full';
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
        button.className = 'px-3 py-1.5 text-sm font-medium rounded-full bg-white/20 dark:bg-gray-700/30 text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-600/50 transition-all';
        button.onclick = () => { 
            dom.chatInput.value = action.command; 
            dom.chatInput.focus(); 
        };
        quickActionsBar.appendChild(button);
    });
    
    inputWrapper.classList.add('relative');
    inputWrapper.style.paddingTop = '3rem';
    inputWrapper.prepend(quickActionsBar);
}

function injectPromptTemplates() {
    const templates = [
        { label: 'Debug Code', prompt: '/code python ' },
        { label: 'Write Email', prompt: 'Write a professional email to [RECIPIENT] about [TOPIC].' },
        { label: 'Explain This', prompt: 'Explain this concept like I am five years old:\n\n' },
        { label: 'Story Idea', prompt: 'Give me a story idea about a [GENRE] that involves [CHARACTER].' }
    ];
    templates.forEach(template => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = template.label;
        button.className = 'px-3 py-1.5 text-sm font-medium rounded-full bg-white/10 dark:bg-gray-700/20 text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-600/40 transition-all';
        button.onclick = () => {
            dom.chatInput.value = template.prompt;
            dom.chatInput.focus();
            dom.chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        };
        dom.promptTemplatesBar.appendChild(button);
    });
}

// ---------- Offline Handling ----------
function updateOfflineStatus() {
    if (isOffline()) {
        dom.offlineIndicator.classList.remove('hidden');
    } else {
        dom.offlineIndicator.classList.add('hidden');
    }
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    // --- Load Base Systems ---
    loadDarkMode();
    loadTheme();
    loadUserName();
    loadAllChats();
    populateModelSelector();
    loadImageModels();
    
    // --- Inject Dynamic UI ---
    injectMicButton();
    injectQuickActions();
    injectPromptTemplates();
    
    // --- Init Speech ---
    initializeSpeechRecognition();

    // --- Event Listeners ---
    dom.darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
    });
    
    // Mobile Sidebar
    dom.mobileMenuBtn.addEventListener('click', () => toggleSidebar());
    document.body.addEventListener('click', (e) => {
        if (e.target === document.body && document.body.classList.contains('sidebar-open')) {
            toggleSidebar(false);
        }
    });
    dom.chatHistoryTab.addEventListener('click', () => switchSidebarTab('chat'));
    dom.galleryTab.addEventListener('click', () => switchSidebarTab('gallery'));
    
    // Profile Menu
    dom.profileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.profileMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!dom.profileMenuBtn.contains(e.target) && !dom.profileMenu.contains(e.target)) {
            dom.profileMenu.classList.add('hidden');
        }
    });
    dom.changeNameBtn.addEventListener('click', changeUserName);
    
    // Chat
    dom.chatForm.addEventListener('submit', handleChatSubmit);
    dom.chatInput.addEventListener('input', () => {
        dom.chatInput.style.height = 'auto';
        dom.chatInput.style.height = (dom.chatInput.scrollHeight) + 'px';
    });
    dom.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            dom.chatForm.dispatchEvent(new Event('submit', { bubbles: true }));
        }
    });

    // Sidebar
    dom.newChatBtn.addEventListener('click', () => selectChat(null));
    dom.exportChatBtn.addEventListener('click', exportChat);
    dom.chatHistoryList.addEventListener('click', (e) => {
        const button = e.target.closest('.chat-history-item');
        if (button && button.dataset.chatId !== 'new-chat-placeholder') {
            selectChat(button.dataset.chatId);
        } else if (button && button.dataset.chatId === 'new-chat-placeholder') {
            selectChat(null);
        }
    });

    // Error
    dom.closeErrorBtn.addEventListener('click', () => dom.errorNotification.classList.add('hidden'));

    // Tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenPrismTutorial');
    if (!hasSeenTutorial && dom.tutorialOverlay) {
        dom.tutorialOverlay.classList.add('visible');
    }
    const closeTutorial = () => {
        if (dom.tutorialOverlay) dom.tutorialOverlay.classList.remove('visible');
        localStorage.setItem('hasSeenPrismTutorial', 'true');
    };
    if (dom.tutorialCloseBtn) dom.tutorialCloseBtn.addEventListener('click', closeTutorial);
    if (dom.tutorialDoneBtn) dom.tutorialDoneBtn.addEventListener('click', closeTutorial);
    
    // Offline Listeners
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    updateOfflineStatus();
});
