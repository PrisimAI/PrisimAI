// chatHistory.js
import { addMessage } from './messages.js';

export let allChats = {};
export let currentChatId = null;

export function saveAllChats() {
    localStorage.setItem('allPrisimAIChats', JSON.stringify(allChats));
}

export function loadAllChats() {
    const saved = localStorage.getItem('allPrisimAIChats');
    if(saved) {
        allChats = JSON.parse(saved);
        const ids = Object.keys(allChats).sort((a,b) => parseInt(b,36)-parseInt(a,36));
        ids.forEach(id => addChatButton(id, allChats[id].title));
        selectChat(ids[0] || null);
    } else selectChat(null);
}

export function addChatButton(chatId, title='New Chat') {
    const chatHistoryList = document.getElementById('chat-history-list');
    const btn = document.createElement('button');
    btn.className = 'chat-history-item w-full p-2';
    btn.dataset.chatId = chatId;
    btn.innerHTML = `<span>${title}</span>`;
    btn.addEventListener('click', () => selectChat(chatId));
    chatHistoryList.prepend(btn);
    return btn;
}

export function selectChat(chatId) {
    currentChatId = chatId || generateChatId();
    if(!allChats[currentChatId]) allChats[currentChatId] = { title:'New Chat', messages: [] };
    loadChatMessages(allChats[currentChatId].messages);
    saveAllChats();
}

export function loadChatMessages(messages) {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    messages.forEach(m => addMessage(m.content, m.role, m.type));
}

function generateChatId() {
    return Date.now().toString(36);
}
