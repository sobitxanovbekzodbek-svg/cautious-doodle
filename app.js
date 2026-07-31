/* ==========================================================================
   AURA 3D — MAIN APPLICATION CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    lucide.createIcons();

    // 2. Initialize Core Subsystems
    const threeManager = new ThreeSceneManager('canvas-container');
    const aiEngine = new AIEngine();
    const audioManager = new AudioManager();

    // 3. UI Element References
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const messagesContainer = document.getElementById('messages-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const micBtn = document.getElementById('mic-btn');
    const statusPulseDot = document.getElementById('status-pulse-dot');
    const statusStateText = document.getElementById('status-state-text');
    const currentPersonaTitle = document.getElementById('current-persona-title');
    const audioVisualizerBar = document.getElementById('audio-visualizer-bar');

    // 3D Control Elements
    const avatarTypeSelect = document.getElementById('avatar-type-select');
    const wireframeToggle = document.getElementById('wireframe-toggle');
    const autorotateToggle = document.getElementById('autorotate-toggle');
    const colorBtns = document.querySelectorAll('.color-btn');

    // Settings & Toggles
    const ttsToggle = document.getElementById('tts-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    const langSelect = document.getElementById('lang-select');

    // API Modal Elements
    const apiModal = document.getElementById('api-modal');
    const apiModalTrigger = document.getElementById('api-modal-trigger');
    const closeApiModal = document.getElementById('close-api-modal');
    const cancelApiBtn = document.getElementById('cancel-api-btn');
    const saveApiBtn = document.getElementById('save-api-btn');
    const apiProviderSelect = document.getElementById('api-provider-select');
    const apiKeyGroup = document.getElementById('api-key-group');
    const apiKeyInput = document.getElementById('api-key-input');

    // Action Buttons
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const exportChatBtn = document.getElementById('export-chat-btn');
    const toggle3dViewBtn = document.getElementById('toggle-3d-view');

    // Application State
    let chatHistory = JSON.parse(localStorage.getItem('aura_chat_history') || '[]');
    let isRecording = false;

    // Load saved chat history if present
    if (chatHistory.length > 0) {
        renderSavedHistory();
    }

    /* ==========================================================================
       EVENT LISTENERS & BINDINGS
       ========================================================================== */

    // Sidebar Navigation Toggle
    openSidebarBtn?.addEventListener('click', () => {
        audioManager.playSFX('click');
        sidebar.classList.add('open');
    });

    closeSidebarBtn?.addEventListener('click', () => {
        audioManager.playSFX('click');
        sidebar.classList.remove('open');
    });

    // AI Persona Selection
    const personaCards = document.querySelectorAll('.persona-card');
    personaCards.forEach(card => {
        card.addEventListener('click', () => {
            audioManager.playSFX('click');
            personaCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const persona = card.dataset.persona;
            aiEngine.setPersona(persona);

            const personaName = card.querySelector('.persona-name').textContent;
            currentPersonaTitle.textContent = personaName;
        });
    });

    // 3D Controls
    avatarTypeSelect?.addEventListener('change', (e) => {
        audioManager.playSFX('toggle');
        threeManager.loadModel(e.target.value);
    });

    wireframeToggle?.addEventListener('change', (e) => {
        audioManager.playSFX('toggle');
        threeManager.setWireframe(e.target.checked);
    });

    autorotateToggle?.addEventListener('change', (e) => {
        audioManager.playSFX('toggle');
        threeManager.setAutoRotate(e.target.checked);
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            audioManager.playSFX('click');
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const colorHex = btn.dataset.color;
            threeManager.setColor(colorHex);
        });
    });

    // Settings Toggles
    ttsToggle?.addEventListener('change', (e) => {
        audioManager.playSFX('toggle');
        audioManager.ttsEnabled = e.target.checked;
        if (!e.target.checked) audioManager.stopSpeaking();
    });

    sfxToggle?.addEventListener('change', (e) => {
        audioManager.sfxEnabled = e.target.checked;
        audioManager.playSFX('toggle');
    });

    langSelect?.addEventListener('change', (e) => {
        audioManager.playSFX('toggle');
        aiEngine.setLanguage(e.target.value);
    });

    // API Modal Management
    apiModalTrigger?.addEventListener('click', () => {
        audioManager.playSFX('click');
        apiProviderSelect.value = aiEngine.provider;
        apiKeyInput.value = aiEngine.apiKey;
        toggleApiKeyInputVisibility();
        apiModal.classList.remove('hidden');
    });

    const hideApiModal = () => {
        audioManager.playSFX('click');
        apiModal.classList.add('hidden');
    };

    closeApiModal?.addEventListener('click', hideApiModal);
    cancelApiBtn?.addEventListener('click', hideApiModal);

    apiProviderSelect?.addEventListener('change', toggleApiKeyInputVisibility);

    function toggleApiKeyInputVisibility() {
        if (apiProviderSelect.value === 'simulated') {
            apiKeyGroup.classList.add('hidden');
        } else {
            apiKeyGroup.classList.remove('hidden');
        }
    }

    saveApiBtn?.addEventListener('click', () => {
        audioManager.playSFX('click');
        aiEngine.setApiConfig(apiProviderSelect.value, apiKeyInput.value.trim());
        hideApiModal();
    });

    // Textarea Auto-expand & Enter Key Handler
    userInput?.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    });

    userInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Quick Suggestion Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            audioManager.playSFX('click');
            const promptText = chip.dataset.prompt;
            userInput.value = promptText;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Voice Input Microphone Button
    micBtn?.addEventListener('click', () => {
        if (!isRecording) {
            audioManager.playSFX('click');
            micBtn.classList.add('recording');
            isRecording = true;
            audioManager.startListening(
                (transcript) => {
                    userInput.value = transcript;
                },
                () => {
                    micBtn.classList.remove('recording');
                    isRecording = false;
                }
            );
        }
    });

    // Clear Chat
    clearChatBtn?.addEventListener('click', () => {
        if (confirm("Chat tarixini haqiqatdan ham tozalamoqchimisiz?")) {
            audioManager.playSFX('click');
            chatHistory = [];
            localStorage.removeItem('aura_chat_history');
            messagesContainer.innerHTML = '';
            location.reload();
        }
    });

    // Export Chat History
    exportChatBtn?.addEventListener('click', () => {
        audioManager.playSFX('click');
        const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AURA_3D_Chat_History_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    /* ==========================================================================
       CHAT MESSAGE HANDLING & 3D STATE SYNCHRONIZATION
       ========================================================================== */

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        audioManager.playSFX('send');

        // Hide welcome card on first message
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) welcomeCard.style.display = 'none';

        // 1. Add User Message
        appendMessage('user', text);
        chatHistory.push({ sender: 'user', text: text, time: new Date().toLocaleTimeString() });
        saveHistory();

        userInput.value = '';
        userInput.style.height = 'auto';

        // 2. Set 3D Avatar to THINKING state
        setUIState('thinking', "AI Savolni Tahlil Qilmoqda...");
        threeManager.setState('thinking');

        // 3. Generate AI Response
        const aiResponseText = await aiEngine.generateResponse(text, chatHistory);

        audioManager.playSFX('receive');

        // 4. Set 3D Avatar to SPEAKING state & Speak TTS
        setUIState('speaking', "AI Javob Bermoqda...");
        threeManager.setState('speaking');
        audioVisualizerBar.classList.remove('hidden');

        // Append AI message bubble with typing effect
        const aiMsgDiv = appendMessage('ai', '');
        await typeWriterEffect(aiMsgDiv.querySelector('.message-bubble'), aiResponseText);

        chatHistory.push({ sender: 'ai', text: aiResponseText, time: new Date().toLocaleTimeString() });
        saveHistory();

        // Speak response out loud using TTS
        audioManager.speak(aiResponseText, aiEngine.currentLang, () => {
            // Callback when speaking finishes
            setUIState('idle', "3D Interaktiv Rejimda");
            threeManager.setState('idle');
            audioVisualizerBar.classList.add('hidden');
        });
    });

    function appendMessage(sender, text) {
        const msgRow = document.createElement('div');
        msgRow.className = `message-row ${sender}`;

        const avatarIcon = sender === 'user' ? 'user' : 'bot';
        const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgRow.innerHTML = `
            <div class="message-avatar">
                <i data-lucide="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${formatMarkdown(text)}</div>
                <span class="message-time">${formattedTime}</span>
            </div>
        `;

        messagesContainer.appendChild(msgRow);
        lucide.createIcons();
        scrollToBottom();
        return msgRow;
    }

    async function typeWriterEffect(container, text) {
        // Parse markdown and render code highlighting
        container.innerHTML = formatMarkdown(text);
        if (window.Prism) Prism.highlightAllUnder(container);
        scrollToBottom();
    }

    function formatMarkdown(text) {
        if (!text) return '';
        // Convert Markdown text to HTML using marked.js
        if (window.marked) {
            return window.marked.parse(text);
        }
        return text;
    }

    function setUIState(state, text) {
        statusPulseDot.className = `status-pulse ${state}`;
        statusStateText.textContent = text;
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function saveHistory() {
        localStorage.setItem('aura_chat_history', JSON.stringify(chatHistory));
    }

    function renderSavedHistory() {
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) welcomeCard.style.display = 'none';

        chatHistory.forEach(msg => {
            appendMessage(msg.sender, msg.text);
        });
    }
});
