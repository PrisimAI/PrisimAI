// messages.js
import { allChats, currentChatId, saveAllChats } from './chatHistory.js';

export function addMessage(content, role, type='text') {
    const chatHistory = document.getElementById('chat-history');
    const wrapper = document.createElement('div');
    wrapper.className = role === 'user' ? 'user-bubble' : 'assistant-bubble';
    wrapper.innerHTML = type==='image' ? `<img src="${content}">` : `<p>${content}</p>`;
    chatHistory.appendChild(wrapper);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    if(currentChatId && content !== '') {
        allChats[currentChatId].messages.push({ role, content, type });
        saveAllChats();
    }
}

export function showLoadingIndicator() {
    const chatHistory = document.getElementById('chat-history');
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    loader.innerHTML = `<div class="bounce-dot"></div><div class="bounce-dot"></div><div class="bounce-dot"></div>`;
    chatHistory.appendChild(loader);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return loader;
}
