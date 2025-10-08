// api.js
import { addMessage } from './messages.js';

const apiKey = 'TOEAP3DuMvvVHUsy';
const textApiUrl = 'https://text.pollinations.ai/openai';
const imageApiUrl = 'https://image.pollinations.ai/prompt/';

export async function fetchModels() {
    const modelSelector = document.getElementById('model-selector');
    modelSelector.innerHTML = '<option>Loading...</option>';
    const resp = await fetch('https://text.pollinations.ai/models');
    const models = await resp.json();
    modelSelector.innerHTML = '';
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id || m.name;
        opt.textContent = m.description || m.name;
        modelSelector.appendChild(opt);
    });
}

export async function streamTextResponse() {
    // Put your existing streaming logic here
}

export async function handleImageResponse(prompt) {
    const imageUrl = `${imageApiUrl}${encodeURIComponent(prompt)}?key=${apiKey}`;
    addMessage(imageUrl,'assistant','image');
}
