/*
 * PrismAI Chat Script
 * Updated with new features:
 * - New API Endpoint & Key
 * - Memory System (/remember, /whoami)
 * - Command System (/summarize, /rewrite, /research, /clearcache, /theme, /persona)
 * - Voice-to-Text (Web Speech API)
 * - Text-to-Speech (Web Speech API)
 * - Customizable Themes (CSS Variables)
 * - AI Typing Indicator
 * - Quick Actions Toolbar
 * - Enhanced Export (.txt, .md, .json)
 * - Model Grouping (<optgroup>)
 * - Smart Retry System (1 retry)
 * - Chat Message Animations (Slide-in)
 * - Model Info Tooltips
 * - Prompt Templates Bar
 *
 * --- NEW IN THIS VERSION ---
 * - External CSS & All styles moved to style.css
 * - Mobile Sidebar (Collapsible w/ burger menu)
 * - Profile Menu (Change Name, save to localStorage)
 * - Image Gallery (New sidebar tab, pulls from localStorage)
 * - Plugin System (Calculator, Dictionary API, Code Formatter)
 * - Enhanced Offline Mode Indicator
 */

(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "tm2922ucwi");

// ---------- Configuration ----------
const config = {
    apiKey: 'HnmNucebqbTDorAfFAkbBGUOYzQVHTcEdHdKKGQQIosjgMativUHGRrUxlYpmKGC',
    referrer: 'https://prisimai.github.io/PrismAI/index.html',
    textApiUrl: 'https://enter.pollinations.ai/api/generate/openai',
    imageApiUrl: 'https://image.pollinations.ai/prompt/',
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
    // New UI elements
    sidebarResizer: document.querySelector('.sidebar-resizer'),
    themePills: document.querySelectorAll('.theme-pill'),
    particlesToggleBtn: document.getElementById('particles-toggle-btn'),
    particlesBg: document.getElementById('particles-bg'),
    aiLogo: document.querySelector('.ai-logo'),
    scrollShadowTop: document.querySelector('.scroll-shadow-top'),
    scrollShadowBottom: document.querySelector('.scroll-shadow-bottom'),
    mobileModelSelector: document.getElementById('mobile-model-selector'),
    mobileNewChatBtn: document.getElementById('mobile-new-chat-btn'),
    // Chat organization elements
    promptsTab: document.getElementById('prompts-tab'),
    promptHistoryPanel: document.getElementById('prompt-history-panel'),
    promptHistoryList: document.getElementById('prompt-history-list'),
    createFolderBtn: document.getElementById('create-folder-btn'),
    chatTagsBtn: document.getElementById('chat-tags-btn'),
    chatFilter: document.getElementById('chat-filter'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    shareChatBtn: document.getElementById('share-chat-btn'),
    autoTitleBtn: document.getElementById('auto-title-btn'),
    shareModal: document.getElementById('share-modal'),
    shareLinkInput: document.getElementById('share-link-input'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    closeShareModal: document.getElementById('close-share-modal'),
    
    // AI Personas & Memory
    personaSelector: document.getElementById('persona-selector'),
    memoryTab: document.getElementById('memory-tab'),
    memoryPanel: document.getElementById('memory-panel'),
    memoryList: document.getElementById('memory-list'),
    addMemoryBtn: document.getElementById('add-memory-btn'),
    addMemoryForm: document.getElementById('add-memory-form'),
    memoryKey: document.getElementById('memory-key'),
    memoryValue: document.getElementById('memory-value'),
    saveMemoryBtn: document.getElementById('save-memory-btn'),
    cancelMemoryBtn: document.getElementById('cancel-memory-btn'),
    
    // Continue conversation
    continueConversation: document.getElementById('continue-conversation'),
    continueBtn: document.getElementById('continue-btn'),
};

// ---------- State ----------
let currentChatId = null;
let allChats = {};
let isRecognizingSpeech = false;
let speechRecognition;
let typingIndicator;
let micButton;

// New state variables
let isResizingSidebar = false;
let particlesEnabled = false;
let currentTheme = 'blue';
let currentPersona = 'default';
let aiMemories = JSON.parse(localStorage.getItem('aiMemories') || '{}');
let messageReactions = {}; // messageId -> {emoji: count}
let editingMessageId = null;

// Chat organization state
let chatFolders = {}; // folderId -> {name, chatIds}
let chatTags = {}; // chatId -> [tags]
let pinnedChats = new Set();
let promptHistory = []; // Recent prompts for reuse
let sharedChats = {}; // chatId -> shareId

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
        // Default to 'chat'
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
    }
    dom.profileMenu.classList.add('hidden'); // Close menu
}

// ---------- Image Gallery ----------
function saveImageToGallery(url, prompt) {
    let gallery = JSON.parse(localStorage.getItem('prismImageGallery') || '[]');
    gallery.unshift({ id: generateChatId(), url, prompt, timestamp: Date.now() });
    localStorage.setItem('prismImageGallery', JSON.stringify(gallery));
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
        imgWrapper.title = item.prompt; // Show prompt on hover
        imgWrapper.innerHTML = `<img src="${item.url}" alt="${item.prompt}">`;
        
        // Optional: Click to view full
        imgWrapper.onclick = () => window.open(item.url, '_blank');
        
        dom.imageGalleryGrid.appendChild(imgWrapper);
    });
}

// ---------- Chat History List ----------
function addChatButton(chatId, title = 'New Chat') {
    const existing = dom.chatHistoryList.querySelector(`[data-chat-id="${chatId}"]`);
    if (existing) return existing;

    const chatButton = document.createElement('button');
    chatButton.className = 'w-full p-3 rounded-xl text-left text-gray-700 dark:text-gray-300 font-medium hover:bg-white/20 transition-all duration-200 active:scale-95 flex items-center space-x-2 chat-history-item';
    chatButton.dataset.chatId = chatId;
    chatButton.setAttribute('aria-label', `Select chat: ${title}`);
    const safeTitle = escapeHTML(title);
    chatButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
        </svg>
        <span class="truncate" title="${safeTitle}">${safeTitle}</span>
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
    const btn = dom.chatHistoryList.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`);
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
        switchSidebarTab('chat'); // Ensure chat tab is active
        toggleSidebar(false); // Close sidebar on mobile
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
    switchSidebarTab('chat'); // Ensure chat tab is active
    toggleSidebar(false); // Close sidebar on mobile
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

function exportChat() {
    if (!currentChatId || !allChats[currentChatId]) {
        showErrorNotification('No chat selected to export.');
        return;
    }
    
    const format = prompt("Enter export format: 'json', 'txt', or 'md'", 'md');
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
    a.download = `PrismAI_Chat_${chatData.title.replace(/\s+/g, '_')}_${currentChatId}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatChatAsTxt(chatData) {
    let text = `Chat Title: ${chatData.title}\nExported: ${new Date().toLocaleString()}\n\n`;
    chatData.messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        text += `[${time}] ${msg.role === 'user' ? 'You' : 'PrismAI'}:\n${msg.content}\n\n`;
    });
    return text;
}

function formatChatAsMd(chatData) {
    let md = `# Chat: ${chatData.title}\n**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
    chatData.messages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const sender = msg.role === 'user' ? 'You' : 'PrismAI';
        md += `**${sender}** (*${time}*):\n\n`;
        if (msg.type === 'image') md += `![Generated Image](${msg.content})\n\n`;
        else if (msg.type === 'code') md += `${msg.content}\n\n`; // Already formatted
        else md += `${msg.content.replace(/\n/g, '  \n')}\n\n`;
    });
    return md;
}

// ---------- Chat UI Management ----------
function addMessage(content, role, type = 'text', animate = true, timestamp = Date.now()) {
    console.log('addMessage called with:', { content, role, type });
    alert('addMessage called with: ' + content + ', role: ' + role);
    
    dom.welcomeMessage.classList.add('hidden');
    dom.chatHistory.classList.remove('hidden');

    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('flex', 'w-full', 'items-start', 'gap-3', 'mb-6');
    messageWrapper.style.opacity = '1'; // Ensure visibility
    
    // Generate unique message ID
    const messageId = generateChatId();
    messageWrapper.setAttribute('data-message-id', messageId);
    
    // Add avatar
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    if (role === 'user') {
        avatar.classList.add('avatar-user');
        avatar.textContent = getUserName().charAt(0).toUpperCase();
        messageWrapper.classList.add('justify-end', 'flex-row-reverse');
    } else {
        avatar.classList.add('avatar-ai');
        avatar.textContent = 'AI';
        messageWrapper.classList.add('justify-start');
    }
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('msg', 'relative');
    
    if (role === 'user') {
        messageContent.classList.add('msg-user');
    } else {
        messageContent.classList.add('msg-assistant', 'group');
    }

    // --- Render based on type ---
    if (type === 'image') {
        messageContent.innerHTML = `<img src="${content}" alt="Generated image" class="rounded-lg max-w-xs md:max-w-md shadow-lg">`;
    } else if (type === 'calculator') {
        messageContent.innerHTML = content; // content is pre-formatted HTML
    } else if (type === 'dictionary') {
        messageContent.innerHTML = content; // content is pre-formatted HTML
    } else if (type === 'code') {
        messageContent.innerHTML = content; // content is pre-formatted HTML
    } else {
        // Default: text
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = content;
        messageContent.appendChild(messageText);
        
        if (role === 'assistant') {
            const speakButton = document.createElement('button');
            speakButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>`;
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
    messageContent.appendChild(time);

    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageContent);
    dom.chatHistory.appendChild(messageWrapper);
    
    // Add message reactions and editing after DOM insertion
    setTimeout(() => {
        addMessageReactions(messageWrapper, messageId);
        if (role === 'user' && type === 'text') {
            addMessageEditing(messageContent, messageId, content);
        }
        updateScrollShadows();
    }, 100);

    requestAnimationFrame(() => {
        dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
    });
    
    return messageWrapper;
}

function showTypingIndicator() {
    if (!typingIndicator) {
        typingIndicator = createLoadingShimmer();
        typingIndicator.classList.add('slide-in-up', 'opacity-0');
        typingIndicator.style.animationFillMode = 'forwards';
    }
    dom.chatHistory.appendChild(typingIndicator);
    dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
    startAIThinking();
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
    stopAIThinking();
}

// ---------- API Communication ----------
async function getAIResponse(messages, model, retryCount = 0) {
    if (isOffline()) throw new Error("You are offline. Please check your internet connection.");
    
    const systemPrompt = getPersonaSystemPrompt();
    const messagesWithContext = [{ role: "system", content: systemPrompt }, ...messages];
    const requestBody = { model: model, messages: messagesWithContext };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);

    try {
        const response = await fetch(config.textApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}`, 'Referer': config.referrer },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`APIError: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) return data.choices[0].message.content;
        if (data.text) return data.text;
        throw new Error("Invalid API response structure.");
    } catch (error) {
        clearTimeout(timeoutId);
        if (retryCount < config.maxRetries && error.name !== 'AbortError') {
            await new Promise(res => setTimeout(res, 1000));
            return getAIResponse(messages, model, retryCount + 1);
        }
        if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.');
        throw error;
    }
}

async function getImageResponse(prompt) {
    if (isOffline()) throw new Error("You are offline. Please check your internet connection.");
    const url = `${config.imageApiUrl}${encodeURIComponent(prompt)}`;
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to generate or load image.'));
        img.src = url;
    });
}

// ---------- Plugin System & Commands ----------
async function handleCommand(message) {
    console.log('handleCommand called with message:', message);
    const parts = message.trim().split(' ');
    const command = parts[0].toLowerCase();
    console.log('command:', command);
    const args = parts.slice(1).join(' ');

    switch (command) {
        case '/image':
            addMessage(message, 'user');
            await handleImageGeneration(args);
            return true;

        // --- Memory ---
        case '/remember':
            if (!args) { addMessage("Usage: /remember [fact about you]", 'assistant', 'text', true); return true; }
            saveUserFact(args);
            addMessage(`Got it. I'll remember that: "${args}"`, 'assistant', 'text', true);
            return true;
        case '/whoami':
        case '/memory':
            const facts = getUserFacts();
            const factResponse = facts ? `Here's what I remember about you:\n\n${facts}` : "I don't have any facts stored for you yet.";
            addMessage(factResponse, 'assistant', 'text', true);
            return true;
        
        // --- Cache & Config ---
        case '/clearcache':
            localStorage.removeItem('apiCache');
            addMessage("API cache cleared.", 'assistant', 'text', true);
            return true;
        case '/theme':
            if (!args) { addMessage("Usage: /theme [color name or hex code]", 'assistant', 'text', true); return true; }
            applyTheme(args);
            addMessage(`Theme accent color changed to ${args}.`, 'assistant', 'text', true);
            return true;
        case '/persona':
            savePersona(args);
            const personaMsg = args ? `Understood. I will now act as a: "${args}"` : `Persona cleared. I'm back to my default self.`;
            addMessage(personaMsg, 'assistant', 'text', true);
            return true;
            
        // --- AI Tools ---
        case '/summarize':
            addMessage(message, 'user');
            await handleSummarizeChat();
            return true;
        case '/rewrite':
            const [tone, ...textToRewrite] = args.split(' ');
            if (!tone || !textToRewrite.length) { addMessage("Usage: /rewrite [tone] [text to rewrite]", 'assistant', 'text', true); return true; }
            addMessage(message, 'user');
            await handleRewriteText(tone, textToRewrite.join(' '));
            return true;
        case '/research':
            if (!args) { addMessage("Usage: /research [topic]", 'assistant', 'text', true); return true; }
            dom.chatInput.value = `Please conduct research on the following topic: "${args}". Provide a structured answer, including a summary, key points, and any relevant sources you can find.`;
            return false; // Let normal submit handle this modified prompt
        
        // --- Plugins ---
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
            if (!lang || !code.length) { addMessage("Usage: /code [language] [code...]", 'assistant', 'text', true); return true; }
            addMessage(message, 'user');
            handleCodeFormatter(lang, code.join(' '));
            return true;

        // --- Help ---
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
- /calc [expression]: (e.g., /calc 5 * (10 + 2))
- /define [word]: Looks up a word definition.
- /code [lang] [code]: Formats a code snippet.
            `;
            addMessage(helpText.trim().replace(/^\s+/gm, ''), 'assistant', 'text', true);
            return true;
    }
    console.log('handleCommand returning false - not a command');
    return false; // Not a command
}

// --- Command Handlers ---
async function handleImageGeneration(prompt) {
    if (!prompt) { addMessage('Usage: `/image [prompt]`', 'assistant', 'text', true); return; }
    showTypingIndicator();
    try {
        const imageUrl = await getImageResponse(prompt);
        hideTypingIndicator();
        addMessage(imageUrl, 'assistant', 'image', true);
        saveMessageToHistory(imageUrl, 'assistant', 'image');
        saveImageToGallery(imageUrl, prompt); // Save to gallery
    } catch (error) {
        hideTypingIndicator();
        showErrorNotification(error.message || 'Failed to generate image.');
    }
}

async function handleSummarizeChat() {
    const chatData = allChats[currentChatId];
    if (!chatData || !chatData.messages.length) { addMessage("There's nothing to summarize yet.", 'assistant', 'text', true); return; }
    const historyText = chatData.messages.filter(m => m.type === 'text').map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
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
    if (!expression) { addMessage('Usage: /calc [mathematical expression]', 'assistant', 'text', true); return; }
    try {
        // Basic validation
        if (/[^0-9\s\.\+\-\*\/\(\)]/g.test(expression)) {
            throw new Error('Invalid characters. Only numbers and operators are allowed.');
        }
        // Safer eval
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
    if (!word) { addMessage('Usage: /define [word]', 'assistant', 'text', true); return; }
    showTypingIndicator();
    try {
        const response = await fetch(`${config.dictionaryApiUrl}${word}`);
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
    // Note: For actual syntax highlighting, a library like Prism.js or highlight.js
    // would need to be added and initialized (e.g., `Prism.highlightAll()`).
}

// ---------- Memory System ----------
function saveUserFact(fact) {
    let facts = JSON.parse(localStorage.getItem('prismUserFacts') || '[]');
    facts.push({ id: generateChatId(), text: fact });
    localStorage.setItem('prismUserFacts', JSON.stringify(facts));
}

function getUserFacts() {
    let facts = JSON.parse(localStorage.getItem('prismUserFacts') || '[]');
    return facts.map(f => `- ${f.text}`).join('\n');
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
    if (!window.SpeechRecognition) { console.warn('Speech Recognition not supported.'); return; }
    
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
    if (!speechRecognition) { showErrorNotification('Speech recognition is not supported.'); return; }
    if (isRecognizingSpeech) speechRecognition.stop();
    else speechRecognition.start();
}

function speakText(text) {
    if (!window.speechSynthesis) { showErrorNotification('Text-to-speech is not supported.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// ---------- Theme System ----------
function applyTheme(color) {
    if (!CSS.supports('color', color)) { showErrorNotification(`Invalid color: ${color}`); return; }
    document.documentElement.style.setProperty('--accent', color);
    localStorage.setItem('prismTheme', color);
    // The styles are now handled by `style.css` using the CSS variable
}

function loadTheme() {
    const savedTheme = localStorage.getItem('prismTheme') || '#3b82f6';
    applyTheme(savedTheme);
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
    console.log('handleChatSubmit called');
    alert('handleChatSubmit called');
    event.preventDefault();
    if (isOffline()) { 
        alert('Offline detected');
        showErrorNotification('You are offline. Please check your connection.'); 
        return; 
    }
    
    const message = dom.chatInput.value.trim();
    console.log('Message:', message);
    alert('Message: ' + message);
    if (!message) {
        alert('No message, returning');
        return;
    }
    
    dom.chatInput.value = '';
    dom.chatInput.style.height = 'auto';
    
    const isCommand = await handleCommand(message);
    console.log('isCommand:', isCommand);
    if (isCommand) {
        console.log('Command detected, returning early');
        return;
    }
    
    // Add to prompt history
    addToPromptHistory(message);
    
    console.log('About to call addMessage');
    alert('About to call addMessage with: ' + message);
    addMessage(message, 'user');
    saveMessageToHistory(message, 'user', 'text');
    showTypingIndicator();
    
    try {
        const chatData = allChats[currentChatId];
        const historyForApi = chatData.messages.filter(m => m.type === 'text').slice(-10).map(m => ({ role: m.role, content: m.content }));
        const aiResponse = await getAIResponse(historyForApi, dom.modelSelector.value);
        hideTypingIndicator();
        addMessage(aiResponse, 'assistant', 'text', true);
        saveMessageToHistory(aiResponse, 'assistant', 'text');
        showContinueButton();
    } catch (error) {
        hideTypingIndicator();
        showErrorNotification(error.message || 'An unknown error occurred.');
    }
}

async function populateModelSelector() {
    dom.modelSelector.innerHTML = ''; // clear old options

    try {
        const res = await fetch('https://enter.pollinations.ai/api/generate/openai/models');
        const json = await res.json();
        if (!json.data || !Array.isArray(json.data)) throw new Error('Invalid model data');

        // Define groups manually for clarity
        const modelGroups = {
            'OpenAI Models': ['openai', 'openai-fast', 'openai-large', 'openai-reasoning', 'openai-audio'],
            'Scaleway Models': ['qwen-coder', 'mistral', 'unity', 'evil'],
            'Bedrock Models': ['roblox-rp', 'claudyclaude', 'chickytutor'],
            'Other / Unknown': ['gemini', 'gemini-search', 'midijourney', 'rtist', 'bidara']
        };

        Object.keys(modelGroups).forEach(groupName => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;

            modelGroups[groupName].forEach(modelId => {
                // Only add if model exists in API response
                if (json.data.some(m => m.id === modelId)) {
                    const option = document.createElement('option');
                    option.value = modelId;
                    option.textContent = modelId;
                    optgroup.appendChild(option);
                }
            });

            dom.modelSelector.appendChild(optgroup);
        });

        // Default selection
        const firstOption = dom.modelSelector.querySelector('option');
        if (firstOption) dom.modelSelector.value = firstOption.value;

    } catch (e) {
        console.error('Failed to load models:', e);
        showErrorNotification('Failed to load AI models.');
    }
}



// ---------- Dynamic UI Injection ----------
function injectMicButton() {
    micButton = document.createElement('button');
    micButton.type = 'button';
    micButton.id = 'mic-button';
    micButton.className = 'p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all absolute right-20 bottom-8';
    micButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 1 0-12 0v1.5a6 6 0 0 0 6 6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`;
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
        button.onclick = () => { dom.chatInput.value = action.command; dom.chatInput.focus(); };
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

// ---------- AI Personas & Memory Management ----------

// AI Persona definitions
const AI_PERSONAS = {
    default: {
        name: "🤖 Default Assistant",
        systemPrompt: "You are a helpful AI assistant. Be concise, accurate, and friendly."
    },
    teacher: {
        name: "👨‍🏫 Teacher",
        systemPrompt: "You are an experienced teacher. Explain concepts clearly, use examples, and encourage learning. Break down complex topics into digestible parts."
    },
    coder: {
        name: "💻 Coding Expert", 
        systemPrompt: "You are a senior software engineer. Provide clean, efficient code solutions with explanations. Focus on best practices and optimization."
    },
    creative: {
        name: "🎨 Creative Writer",
        systemPrompt: "You are a creative writer. Use vivid language, storytelling techniques, and imaginative approaches. Be expressive and engaging."
    },
    analyst: {
        name: "📊 Data Analyst",
        systemPrompt: "You are a data analyst. Focus on facts, statistics, logical reasoning, and evidence-based conclusions. Be precise and analytical."
    },
    casual: {
        name: "😎 Casual Friend",
        systemPrompt: "You are a casual, friendly companion. Use relaxed language, be conversational, and show genuine interest. Keep things light and fun."
    }
};

// Initialize AI personas and memory management
function initializeAIPersonasAndMemory() {
    // Persona selector
    if (dom.personaSelector) {
        dom.personaSelector.addEventListener('change', (e) => {
            currentPersona = e.target.value;
            localStorage.setItem('currentPersona', currentPersona);
        });
        
        // Load saved persona
        const savedPersona = localStorage.getItem('currentPersona');
        if (savedPersona && AI_PERSONAS[savedPersona]) {
            currentPersona = savedPersona;
            dom.personaSelector.value = savedPersona;
        }
    }
    
    // Memory tab
    if (dom.memoryTab) {
        dom.memoryTab.addEventListener('click', () => switchSidebarTab('memory'));
    }
    
    // Memory management
    if (dom.addMemoryBtn) {
        dom.addMemoryBtn.addEventListener('click', showAddMemoryForm);
    }
    
    if (dom.saveMemoryBtn) {
        dom.saveMemoryBtn.addEventListener('click', saveMemory);
    }
    
    if (dom.cancelMemoryBtn) {
        dom.cancelMemoryBtn.addEventListener('click', hideAddMemoryForm);
    }
    
    // Continue conversation
    if (dom.continueBtn) {
        dom.continueBtn.addEventListener('click', continueConversation);
    }
    
    // Load and display memories
    displayMemories();
}

// Show add memory form
function showAddMemoryForm() {
    if (dom.addMemoryForm) {
        dom.addMemoryForm.classList.remove('hidden');
        dom.memoryKey.focus();
    }
}

// Hide add memory form
function hideAddMemoryForm() {
    if (dom.addMemoryForm) {
        dom.addMemoryForm.classList.add('hidden');
        dom.memoryKey.value = '';
        dom.memoryValue.value = '';
    }
}

// Save memory
function saveMemory() {
    const key = dom.memoryKey.value.trim();
    const value = dom.memoryValue.value.trim();
    
    if (!key || !value) {
        alert('Please enter both a memory key and value.');
        return;
    }
    
    aiMemories[key] = {
        value: value,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    localStorage.setItem('aiMemories', JSON.stringify(aiMemories));
    displayMemories();
    hideAddMemoryForm();
}

// Display memories
function displayMemories() {
    if (!dom.memoryList) return;
    
    const memories = Object.entries(aiMemories);
    
    if (memories.length === 0) {
        dom.memoryList.innerHTML = '<div class="text-xs text-gray-400 text-center py-4">No memories stored yet. Add facts for the AI to remember about you.</div>';
        return;
    }
    
    dom.memoryList.innerHTML = memories.map(([key, data]) => `
        <div class="memory-item p-3 bg-white/10 dark:bg-gray-800/30 rounded-lg">
            <div class="flex items-center justify-between mb-2">
                <div class="font-medium text-sm text-gray-800 dark:text-gray-200">${escapeHTML(key)}</div>
                <button onclick="deleteMemory('${escapeHTML(key)}')" class="text-red-500 hover:text-red-600 text-xs">
                    Delete
                </button>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">${escapeHTML(data.value)}</div>
            <div class="text-xs text-gray-500 mt-1">${new Date(data.createdAt).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// Delete memory
function deleteMemory(key) {
    if (confirm(`Delete memory "${key}"?`)) {
        delete aiMemories[key];
        localStorage.setItem('aiMemories', JSON.stringify(aiMemories));
        displayMemories();
    }
}

// Continue conversation
function continueConversation() {
    const continuePrompt = "Please continue your previous response or elaborate further on the topic.";
    
    // Add user message
    addMessage('user', continuePrompt, 'You');
    
    // Send to AI
    sendMessage(continuePrompt);
    
    // Hide continue button
    if (dom.continueConversation) {
        dom.continueConversation.classList.add('hidden');
    }
}

// Get persona system prompt
function getPersonaSystemPrompt() {
    const persona = AI_PERSONAS[currentPersona] || AI_PERSONAS.default;
    let systemPrompt = persona.systemPrompt;
    
    // Add memory context if available
    const memoryEntries = Object.entries(aiMemories);
    if (memoryEntries.length > 0) {
        const memoryContext = memoryEntries.map(([key, data]) => `${key}: ${data.value}`).join(', ');
        systemPrompt += `\n\nRemember these facts about the user: ${memoryContext}`;
    }
    
    return systemPrompt;
}

// Show continue button after AI responses
function showContinueButton() {
    if (dom.continueConversation) {
        dom.continueConversation.classList.remove('hidden');
    }
}

// ---------- Initialization ----------
// ---------- New UI Features ----------

// Theme System
function initializeThemeSystem() {
    // Load saved theme
    const savedTheme = localStorage.getItem('prismTheme') || 'blue';
    setTheme(savedTheme);
    
    // Add event listeners to theme pills
    dom.themePills.forEach(pill => {
        pill.addEventListener('click', () => {
            const theme = pill.dataset.theme;
            setTheme(theme);
            localStorage.setItem('prismTheme', theme);
        });
    });
}

function setTheme(theme) {
    currentTheme = theme;
    
    // Remove active class from all pills
    dom.themePills.forEach(pill => pill.classList.remove('active'));
    
    // Add active class to selected pill
    const activePill = document.querySelector(`[data-theme="${theme}"]`);
    if (activePill) activePill.classList.add('active');
    
    // Set CSS custom property
    const themeColors = {
        blue: '#3b82f6',
        neon: '#10b981',
        cyberpunk: '#8b5cf6',
        fire: '#ef4444',
        space: '#6366f1'
    };
    
    document.documentElement.style.setProperty('--accent', themeColors[theme]);
}

// Resizable Sidebar
function initializeResizableSidebar() {
    if (!dom.sidebarResizer) return;
    
    dom.sidebarResizer.addEventListener('mousedown', startResize);
    
    function startResize(e) {
        isResizingSidebar = true;
        dom.sidebarResizer.classList.add('resizing');
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    }
    
    function doResize(e) {
        if (!isResizingSidebar) return;
        
        const newWidth = e.clientX - dom.sidebar.offsetLeft;
        if (newWidth >= 200 && newWidth <= 500) {
            dom.sidebar.style.width = newWidth + 'px';
        }
    }
    
    function stopResize() {
        isResizingSidebar = false;
        dom.sidebarResizer.classList.remove('resizing');
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        
        // Save width to localStorage
        localStorage.setItem('sidebarWidth', dom.sidebar.style.width);
    }
    
    // Load saved width
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
        dom.sidebar.style.width = savedWidth;
    }
}

// Floating Particles Background
function initializeParticlesBackground() {
    if (!dom.particlesToggleBtn || !dom.particlesBg) return;
    
    // Load saved preference
    particlesEnabled = localStorage.getItem('particlesEnabled') === 'true';
    updateParticlesDisplay();
    
    dom.particlesToggleBtn.addEventListener('click', () => {
        particlesEnabled = !particlesEnabled;
        localStorage.setItem('particlesEnabled', particlesEnabled);
        updateParticlesDisplay();
    });
}

function updateParticlesDisplay() {
    if (particlesEnabled) {
        dom.particlesBg.style.display = 'block';
        createParticles();
        dom.particlesToggleBtn.textContent = '✨ Particles ON';
        dom.particlesToggleBtn.classList.add('bg-blue-500/20');
    } else {
        dom.particlesBg.style.display = 'none';
        dom.particlesToggleBtn.textContent = '✨ Particles';
        dom.particlesToggleBtn.classList.remove('bg-blue-500/20');
    }
}

function createParticles() {
    // Clear existing particles
    dom.particlesBg.innerHTML = '';
    
    // Create 20 particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        dom.particlesBg.appendChild(particle);
    }
}

// Scroll Shadows
function initializeScrollShadows() {
    if (!dom.scrollShadowTop || !dom.scrollShadowBottom) return;
    
    const chatHistory = dom.chatHistory;
    if (!chatHistory) return;
    
    chatHistory.addEventListener('scroll', updateScrollShadows);
    
    // Initial check
    setTimeout(updateScrollShadows, 100);
}

function updateScrollShadows() {
    const chatHistory = dom.chatHistory;
    if (!chatHistory || !dom.scrollShadowTop || !dom.scrollShadowBottom) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatHistory;
    
    // Top shadow
    const topOpacity = Math.min(scrollTop / 50, 1);
    dom.scrollShadowTop.style.opacity = topOpacity;
    
    // Bottom shadow
    const bottomOpacity = Math.min((scrollHeight - scrollTop - clientHeight) / 50, 1);
    dom.scrollShadowBottom.style.opacity = bottomOpacity;
}

// Mobile UI
function initializeMobileUI() {
    if (dom.mobileModelSelector && dom.modelSelector) {
        // Sync mobile model selector with main selector
        dom.modelSelector.addEventListener('change', () => {
            dom.mobileModelSelector.value = dom.modelSelector.value;
        });
        
        dom.mobileModelSelector.addEventListener('change', () => {
            dom.modelSelector.value = dom.mobileModelSelector.value;
        });
    }
    
    if (dom.mobileNewChatBtn) {
        dom.mobileNewChatBtn.addEventListener('click', () => selectChat(null));
    }
}

// Ripple Effects
function initializeRippleEffects() {
    // Add ripple effect to buttons with the class
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Message Reactions
function addMessageReactions(messageElement, messageId) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    
    // Move message into container
    const parent = messageElement.parentNode;
    parent.insertBefore(messageContainer, messageElement);
    messageContainer.appendChild(messageElement);
    
    // Add reactions trigger
    const reactionsTrigger = document.createElement('div');
    reactionsTrigger.className = 'message-reactions-trigger';
    reactionsTrigger.innerHTML = '😊+';
    messageContainer.appendChild(reactionsTrigger);
    
    // Add reactions popup
    const reactionsPopup = document.createElement('div');
    reactionsPopup.className = 'message-reactions-popup';
    reactionsPopup.innerHTML = `
        <span class="reaction-btn" data-emoji="👍">👍</span>
        <span class="reaction-btn" data-emoji="❤️">❤️</span>
        <span class="reaction-btn" data-emoji="🔥">🔥</span>
        <span class="reaction-btn" data-emoji="😂">😂</span>
        <span class="reaction-btn" data-emoji="😮">😮</span>
    `;
    messageContainer.appendChild(reactionsPopup);
    
    // Add reactions display
    const reactionsDisplay = document.createElement('div');
    reactionsDisplay.className = 'message-reactions-display';
    messageContainer.appendChild(reactionsDisplay);
    
    // Event listeners
    reactionsTrigger.addEventListener('click', () => {
        reactionsPopup.classList.toggle('show');
    });
    
    reactionsPopup.addEventListener('click', (e) => {
        if (e.target.classList.contains('reaction-btn')) {
            const emoji = e.target.dataset.emoji;
            addReaction(messageId, emoji);
            reactionsPopup.classList.remove('show');
        }
    });
    
    // Load existing reactions
    updateReactionsDisplay(messageId, reactionsDisplay);
}

function addReaction(messageId, emoji) {
    if (!messageReactions[messageId]) {
        messageReactions[messageId] = {};
    }
    
    if (!messageReactions[messageId][emoji]) {
        messageReactions[messageId][emoji] = { count: 0, userReacted: false };
    }
    
    if (messageReactions[messageId][emoji].userReacted) {
        messageReactions[messageId][emoji].count--;
        messageReactions[messageId][emoji].userReacted = false;
        
        if (messageReactions[messageId][emoji].count <= 0) {
            delete messageReactions[messageId][emoji];
        }
    } else {
        messageReactions[messageId][emoji].count++;
        messageReactions[messageId][emoji].userReacted = true;
    }
    
    // Save to localStorage
    localStorage.setItem('messageReactions', JSON.stringify(messageReactions));
    
    // Update display
    const messageContainer = document.querySelector(`[data-message-id="${messageId}"]`)?.closest('.message-container');
    if (messageContainer) {
        const reactionsDisplay = messageContainer.querySelector('.message-reactions-display');
        updateReactionsDisplay(messageId, reactionsDisplay);
    }
}

function updateReactionsDisplay(messageId, reactionsDisplay) {
    if (!messageReactions[messageId]) return;
    
    reactionsDisplay.innerHTML = '';
    
    Object.entries(messageReactions[messageId]).forEach(([emoji, data]) => {
        if (data.count > 0) {
            const reactionEl = document.createElement('span');
            reactionEl.className = `reaction-display ${data.userReacted ? 'user-reacted' : ''}`;
            reactionEl.innerHTML = `${emoji} ${data.count}`;
            reactionEl.addEventListener('click', () => addReaction(messageId, emoji));
            reactionsDisplay.appendChild(reactionEl);
        }
    });
}

// Message Editing
function addMessageEditing(messageElement, messageId, messageText) {
    if (messageElement.classList.contains('msg-assistant')) return; // Only allow editing user messages
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditingMessage(messageId, messageText, messageElement));
    
    messageElement.appendChild(editBtn);
}

function startEditingMessage(messageId, messageText, messageElement) {
    if (editingMessageId) return; // Already editing another message
    
    editingMessageId = messageId;
    
    const editContainer = document.createElement('div');
    editContainer.className = 'message-edit-container';
    
    const editInput = document.createElement('textarea');
    editInput.className = 'message-edit-input';
    editInput.value = messageText;
    
    const editActions = document.createElement('div');
    editActions.className = 'message-edit-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-edit-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => saveMessageEdit(messageId, editInput.value, messageElement, editContainer));
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-edit-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => cancelMessageEdit(editContainer));
    
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    editContainer.appendChild(editInput);
    editContainer.appendChild(editActions);
    
    messageElement.appendChild(editContainer);
    editInput.focus();
}

function saveMessageEdit(messageId, newText, messageElement, editContainer) {
    // Update the message text in the chat
    const messageTextElement = messageElement.querySelector('.message-text') || messageElement;
    messageTextElement.textContent = newText;
    
    // Update in chat history
    if (currentChatId && allChats[currentChatId]) {
        const messageIndex = allChats[currentChatId].messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            allChats[currentChatId].messages[messageIndex].text = newText;
            saveAllChats();
        }
    }
    
    cancelMessageEdit(editContainer);
}

function cancelMessageEdit(editContainer) {
    editContainer.remove();
    editingMessageId = null;
}

// AI Logo Animation
function startAIThinking() {
    if (dom.aiLogo) {
        dom.aiLogo.classList.add('thinking');
    }
}

function stopAIThinking() {
    if (dom.aiLogo) {
        dom.aiLogo.classList.remove('thinking');
    }
}

// Loading Shimmer for AI Messages
function createLoadingShimmer() {
    const shimmerContainer = document.createElement('div');
    shimmerContainer.className = 'ai-typing-indicator';
    shimmerContainer.innerHTML = `
        <div class="chat-avatar avatar-ai">AI</div>
        <div>
            <div class="loading-shimmer"></div>
            <div class="loading-shimmer" style="width: 80%;"></div>
            <div class="loading-shimmer" style="width: 60%;"></div>
        </div>
    `;
    return shimmerContainer;
}

// Load message reactions from localStorage
function loadMessageReactions() {
    try {
        const saved = localStorage.getItem('messageReactions');
        if (saved) {
            messageReactions = JSON.parse(saved);
        }
    } catch (error) {
        console.warn('Failed to load message reactions:', error);
        messageReactions = {};
    }
}

// ---------- Chat Organization Features ----------

// Initialize chat organization features
function initializeChatOrganization() {
    loadChatOrganizationData();
    
    // Event listeners
    if (dom.promptsTab) {
        dom.promptsTab.addEventListener('click', () => switchSidebarTab('prompts'));
    }
    
    if (dom.createFolderBtn) {
        dom.createFolderBtn.addEventListener('click', createChatFolder);
    }
    
    if (dom.chatTagsBtn) {
        dom.chatTagsBtn.addEventListener('click', manageChatTags);
    }
    
    if (dom.chatFilter) {
        dom.chatFilter.addEventListener('change', filterChats);
    }
    
    if (dom.exportPdfBtn) {
        dom.exportPdfBtn.addEventListener('click', exportChatToPDF);
    }
    
    if (dom.shareChatBtn) {
        dom.shareChatBtn.addEventListener('click', shareCurrentChat);
    }
    
    if (dom.autoTitleBtn) {
        dom.autoTitleBtn.addEventListener('click', autoTitleCurrentChat);
    }
    
    if (dom.copyLinkBtn) {
        dom.copyLinkBtn.addEventListener('click', copyShareLink);
    }
    
    if (dom.closeShareModal) {
        dom.closeShareModal.addEventListener('click', () => {
            dom.shareModal.classList.remove('show');
        });
    }
    
    // Close modal on backdrop click
    if (dom.shareModal) {
        dom.shareModal.addEventListener('click', (e) => {
            if (e.target === dom.shareModal) {
                dom.shareModal.classList.remove('show');
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dom.shareModal.classList.contains('show')) {
                dom.shareModal.classList.remove('show');
            }
        });
    }
}

// Load chat organization data from localStorage
function loadChatOrganizationData() {
    try {
        const folders = localStorage.getItem('chatFolders');
        if (folders) chatFolders = JSON.parse(folders);
        
        const tags = localStorage.getItem('chatTags');
        if (tags) chatTags = JSON.parse(tags);
        
        const pinned = localStorage.getItem('pinnedChats');
        if (pinned) pinnedChats = new Set(JSON.parse(pinned));
        
        const prompts = localStorage.getItem('promptHistory');
        if (prompts) promptHistory = JSON.parse(prompts);
        
        const shared = localStorage.getItem('sharedChats');
        if (shared) sharedChats = JSON.parse(shared);
    } catch (error) {
        console.warn('Failed to load chat organization data:', error);
    }
}

// Save chat organization data to localStorage
function saveChatOrganizationData() {
    localStorage.setItem('chatFolders', JSON.stringify(chatFolders));
    localStorage.setItem('chatTags', JSON.stringify(chatTags));
    localStorage.setItem('pinnedChats', JSON.stringify([...pinnedChats]));
    localStorage.setItem('promptHistory', JSON.stringify(promptHistory));
    localStorage.setItem('sharedChats', JSON.stringify(sharedChats));
}

// Add prompt to history
function addToPromptHistory(prompt) {
    if (!prompt || prompt.length < 5) return;
    
    // Remove if already exists
    promptHistory = promptHistory.filter(p => p.text !== prompt);
    
    // Add to beginning
    promptHistory.unshift({
        text: prompt,
        timestamp: Date.now(),
        uses: 1
    });
    
    // Keep only last 50 prompts
    if (promptHistory.length > 50) {
        promptHistory = promptHistory.slice(0, 50);
    }
    
    saveChatOrganizationData();
    updatePromptHistoryDisplay();
}

// Update prompt history display
function updatePromptHistoryDisplay() {
    if (!dom.promptHistoryList) return;
    
    if (promptHistory.length === 0) {
        dom.promptHistoryList.innerHTML = '<div class="text-xs text-gray-400 text-center py-4">No prompts yet. Start chatting to see your prompt history here.</div>';
        return;
    }
    
    dom.promptHistoryList.innerHTML = promptHistory.map(prompt => `
        <div class="prompt-history-item" data-prompt="${escapeHTML(prompt.text)}">
            <div class="prompt-text">${escapeHTML(prompt.text)}</div>
            <div class="prompt-meta">
                <span>${new Date(prompt.timestamp).toLocaleDateString()}</span>
                <span>Used ${prompt.uses} time${prompt.uses > 1 ? 's' : ''}</span>
            </div>
        </div>
    `).join('');
    
    // Add click listeners
    dom.promptHistoryList.querySelectorAll('.prompt-history-item').forEach(item => {
        item.addEventListener('click', () => {
            const prompt = item.dataset.prompt;
            dom.chatInput.value = prompt;
            dom.chatInput.focus();
            
            // Update usage count
            const historyItem = promptHistory.find(p => p.text === prompt);
            if (historyItem) {
                historyItem.uses++;
                saveChatOrganizationData();
                updatePromptHistoryDisplay();
            }
        });
    });
}

// Switch sidebar tab (extended to include prompts)
function switchSidebarTab(tab) {
    // Remove active class from all tabs
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active-tab'));
    
    // Hide all panels
    dom.chatHistoryListContainer.classList.add('hidden');
    dom.imageGalleryPanel.classList.add('hidden');
    if (dom.promptHistoryPanel) dom.promptHistoryPanel.classList.add('hidden');
    if (dom.memoryPanel) dom.memoryPanel.classList.add('hidden');
    
    if (tab === 'chat') {
        dom.chatHistoryTab.classList.add('active-tab');
        dom.chatHistoryListContainer.classList.remove('hidden');
    } else if (tab === 'gallery') {
        dom.galleryTab.classList.add('active-tab');
        dom.imageGalleryPanel.classList.remove('hidden');
    } else if (tab === 'prompts' && dom.promptHistoryPanel) {
        dom.promptsTab.classList.add('active-tab');
        dom.promptHistoryPanel.classList.remove('hidden');
        updatePromptHistoryDisplay();
    } else if (tab === 'memory' && dom.memoryPanel) {
        dom.memoryTab.classList.add('active-tab');
        dom.memoryPanel.classList.remove('hidden');
        displayMemories();
    }
}

// Create chat folder
function createChatFolder() {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;
    
    const folderId = generateChatId();
    chatFolders[folderId] = {
        name: folderName,
        chatIds: []
    };
    
    saveChatOrganizationData();
    updateChatHistoryList();
}

// Manage chat tags
function manageChatTags() {
    if (!currentChatId) {
        alert('Please select a chat first.');
        return;
    }
    
    const currentTags = chatTags[currentChatId] || [];
    const newTags = prompt('Enter tags (comma-separated):', currentTags.join(', '));
    
    if (newTags === null) return;
    
    if (newTags.trim() === '') {
        delete chatTags[currentChatId];
    } else {
        chatTags[currentChatId] = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    saveChatOrganizationData();
    updateChatHistoryList();
}

// Filter chats
function filterChats() {
    const filter = dom.chatFilter.value;
    updateChatHistoryList(filter);
}

// Pin/unpin chat
function togglePinChat(chatId) {
    if (pinnedChats.has(chatId)) {
        pinnedChats.delete(chatId);
    } else {
        pinnedChats.add(chatId);
    }
    
    saveChatOrganizationData();
    updateChatHistoryList();
}

// Export chat to PDF
async function exportChatToPDF() {
    if (!currentChatId || !allChats[currentChatId]) {
        alert('No chat to export.');
        return;
    }
    
    try {
        // Create a simple HTML version for PDF export
        const chat = allChats[currentChatId];
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>PrismAI Chat Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .message { margin: 10px 0; padding: 10px; border-radius: 8px; }
                    .user { background: #e3f2fd; text-align: right; }
                    .assistant { background: #f5f5f5; }
                    .timestamp { font-size: 12px; color: #666; margin-top: 5px; }
                </style>
            </head>
            <body>
                <h1>PrismAI Chat Export</h1>
                <p>Exported on: ${new Date().toLocaleString()}</p>
                <p>Chat Title: ${chat.title || 'Untitled Chat'}</p>
                <hr>
                ${chat.messages.map(msg => `
                    <div class="message ${msg.role}">
                        <div><strong>${msg.role === 'user' ? 'You' : 'PrismAI'}:</strong></div>
                        <div>${escapeHTML(msg.content)}</div>
                        <div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
        
        // Create blob and download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prism-chat-${chat.title || 'export'}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Note: For actual PDF generation, you'd need a library like jsPDF or html2pdf
        alert('Chat exported as HTML file. For PDF conversion, you can print this file as PDF from your browser.');
        
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export chat.');
    }
}

// Share current chat
function shareCurrentChat() {
    if (!currentChatId || !allChats[currentChatId]) {
        alert('No chat to share.');
        return;
    }
    
    // Generate share ID if not exists
    let shareId = sharedChats[currentChatId];
    if (!shareId) {
        shareId = generateChatId();
        sharedChats[currentChatId] = shareId;
        saveChatOrganizationData();
    }
    
    // Create share URL (this would typically be a real server endpoint)
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    
    dom.shareLinkInput.value = shareUrl;
    dom.shareModal.classList.add('show');
}

// Copy share link to clipboard
async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(dom.shareLinkInput.value);
        dom.copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => {
            dom.copyLinkBtn.textContent = 'Copy Link';
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        dom.shareLinkInput.select();
        document.execCommand('copy');
        dom.copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => {
            dom.copyLinkBtn.textContent = 'Copy Link';
        }, 2000);
    }
}

// Auto-title current chat with AI
async function autoTitleCurrentChat() {
    if (!currentChatId || !allChats[currentChatId] || !allChats[currentChatId].messages.length) {
        alert('No chat to title.');
        return;
    }
    
    try {
        const chat = allChats[currentChatId];
        const firstMessages = chat.messages.slice(0, 3).map(msg => `${msg.role}: ${msg.content}`).join('\n');
        
        const titlePrompt = `Based on this conversation, suggest a short, descriptive title (max 5 words):\n\n${firstMessages}`;
        
        const response = await getAIResponse([{ role: 'user', content: titlePrompt }], dom.modelSelector.value);
        
        if (response) {
            const title = response.trim().replace(/['"]/g, '').substring(0, 50);
            chat.title = title;
            saveAllChats();
            updateChatHistoryList();
            alert(`Chat titled: "${title}"`);
        }
    } catch (error) {
        console.error('Auto-title failed:', error);
        alert('Failed to generate title.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Load Base Systems ---
    loadTheme();
    loadUserName();
    loadAllChats();
    loadMessageReactions();
    populateModelSelector();
    
    // --- Inject Dynamic UI ---
    injectMicButton();
    injectQuickActions();
    injectPromptTemplates();
    
    // --- Init Speech ---
    initializeSpeechRecognition();
    
    // --- Init New Features ---
    initializeThemeSystem();
    initializeResizableSidebar();
    initializeParticlesBackground();
    initializeScrollShadows();
    initializeMobileUI();
    initializeRippleEffects();
    initializeChatOrganization();
    initializeAIPersonasAndMemory();
    


    // --- Event Listeners ---
    dom.darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
    });
    
    // Mobile Sidebar
    dom.mobileMenuBtn.addEventListener('click', () => toggleSidebar());
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'BODY' && document.body.classList.contains('sidebar-open')) {
            toggleSidebar(false);
        }
    });
    dom.chatHistoryTab.addEventListener('click', () => switchSidebarTab('chat'));
    dom.galleryTab.addEventListener('click', () => switchSidebarTab('gallery'));
    
    // Profile Menu
    dom.profileMenuBtn.addEventListener('click', () => dom.profileMenu.classList.toggle('hidden'));
    dom.changeNameBtn.addEventListener('click', changeUserName);
    
    // Chat
    console.log('Attaching submit event listener to:', dom.chatForm);
    if (!dom.chatForm) {
        alert('ERROR: chatForm element not found!');
        return;
    }
    dom.chatForm.addEventListener('submit', handleChatSubmit);
    
    // Test if event listener is working by adding a backup listener
    document.getElementById('chat-form').addEventListener('submit', function(e) {
        alert('Backup event listener triggered!');
    });
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
        if (button) selectChat(button.dataset.chatId);
    });

    // Error
    dom.closeErrorBtn.addEventListener('click', () => dom.errorNotification.classList.add('hidden'));

    // Tutorial
    const hasSeenTutorial = localStorage.getItem('hasSeenPrismTutorial');
    if (!hasSeenTutorial && dom.tutorialOverlay) dom.tutorialOverlay.classList.add('visible');
    const closeTutorial = () => {
        if (dom.tutorialOverlay) dom.tutorialOverlay.classList.remove('visible');
        localStorage.setItem('hasSeenPrismTutorial', 'true');
    };
    if (dom.tutorialCloseBtn) dom.tutorialCloseBtn.addEventListener('click', closeTutorial);
    if (dom.tutorialDoneBtn) dom.tutorialDoneBtn.addEventListener('click', closeTutorial);
    
    // Offline Listeners
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    updateOfflineStatus(); // Initial check
});
