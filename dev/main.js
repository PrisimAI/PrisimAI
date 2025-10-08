// main.js
import { initTheme } from './theme.js';
import { loadAllChats } from './chatHistory.js';
import { addMessage } from './messages.js';
import { fetchModels, handleImageResponse, streamTextResponse } from './api.js';

document.getElementById('chat-form').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    input.value = '';
    addMessage(msg, 'user');

    if(msg.toLowerCase().startsWith('/image')) {
        await handleImageResponse(msg.slice(6).trim());
    } else {
        await streamTextResponse();
    }
});

// Initialize
initTheme();
loadAllChats();
fetchModels();
