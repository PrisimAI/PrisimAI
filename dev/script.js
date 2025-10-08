// Dark mode toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    }
}

// Chat management
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const chatForm = document.getElementById('chat-form');
const welcomeMessage = document.getElementById('welcome-message');
const newChatBtn = document.getElementById('new-chat-btn');
const modelSelector = document.getElementById('model-selector');
const chatHistoryList = document.getElementById('chat-history-list');

let currentChatId = null;
let allChats = {};
const apiKey = 'TOEAP3DuMvvVHUsy';
const referrer = 'https://prisimai.github.io/PrismAI/index.html';
const textApiUrl = 'https://text.pollinations.ai/openai';
const imageApiUrl = 'https://image.pollinations.ai/prompt/';

// Helpers
function generateChatId() {
    return 'chat-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
        '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    })[m]);
}

function addChatButton(chatId, title = 'New Chat') {
    const btn = document.createElement('button');
    btn.textContent = title;
    btn.className = 'chat-btn fade-in';
    btn.dataset.chatId = chatId;
    btn.addEventListener('click', () => selectChat(chatId));
    chatHistoryList.prepend(btn);
    return btn;
}

function setActiveChatButton(chatId) {
    document.querySelectorAll('.chat-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.chat-btn[data-chat-id="${chatId}"]`);
    if (btn) btn.classList.add('active');
}

function updateChatButtonTitle(chatId, newTitle) {
    const btn = document.querySelector(`.chat-btn[data-chat-id="${chatId}"]`);
    if (btn) btn.textContent = newTitle;
}

function selectChat(chatId) {
    currentChatId = chatId;
    setActiveChatButton(chatId);
    loadChatMessages(chatId);
}

function loadChatMessages(chatId) {
    chatHistory.innerHTML = '';
    if (!allChats[chatId]) return;
    allChats[chatId].forEach(msg => addMessage(msg.role, msg.content));
}

function saveAllChats() {
    localStorage.setItem('prismAI_chats', JSON.stringify(allChats));
}

function loadAllChats() {
    const saved = localStorage.getItem('prismAI_chats');
    if (saved) allChats = JSON.parse(saved);
}

function addMessage(role, content) {
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'user-bubble' : 'assistant-bubble';
    bubble.innerHTML = escapeHTML(content);
    chatHistory.appendChild(bubble);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Input submit
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;
        addMessage('user', message);
        chatInput.value = '';
        handleChat(message);
    });
}

// Fetch AI response
async function handleChat(message) {
    const chatId = currentChatId || generateChatId();
    if (!allChats[chatId]) allChats[chatId] = [];
    allChats[chatId].push({role:'user', content:message});
    saveAllChats();

    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble';
    bubble.textContent = '...';
    chatHistory.appendChild(bubble);

    try {
        const res = await fetch(textApiUrl, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({prompt: message, key: apiKey})
        });
        const data = await res.json();
        bubble.textContent = data.text || 'Sorry, no response.';
        allChats[chatId].push({role:'assistant', content: bubble.textContent});
        saveAllChats();
    } catch(e) {
        bubble.textContent = 'Error fetching AI response.';
    }

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Initialize
loadAllChats();
