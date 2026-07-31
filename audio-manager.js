/* ==========================================================================
   AURA 3D — AUDIO MANAGER (WEB AUDIO FX & SPEECH SYNTHESIS/RECOGNITION)
   ========================================================================== */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.ttsEnabled = true;
        this.synth = window.speechSynthesis;
        this.recognition = null;

        this.initAudioContext();
        this.initSpeechRecognition();
    }

    initAudioContext() {
        // Lazy initialize AudioContext on user interaction to abide by browser autoplay policies
        const init = () => {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            window.removeEventListener('click', init);
            window.removeEventListener('keydown', init);
        };
        window.addEventListener('click', init);
        window.addEventListener('keydown', init);
    }

    // Web Audio Synthesized Futuristic UI Sound Effects
    playSFX(type) {
        if (!this.sfxEnabled) return;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case 'send':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;

            case 'receive':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(900, now + 0.08);
                osc.frequency.setValueAtTime(1200, now + 0.16);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;

            case 'toggle':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
        }
    }

    // Text-To-Speech (TTS)
    speak(text, lang = 'uz-UZ', onEndCallback = null) {
        if (!this.ttsEnabled || !this.synth) return;

        // Cancel previous speaking utterance
        this.synth.cancel();

        // Strip markdown symbols for clean speech synthesis
        const cleanText = text.replace(/```[\s\S]*?```/g, "Kod namunasi taqdim etildi.")
                             .replace(/[*#_`~]/g, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Language setup
        if (lang.startsWith('uz')) {
            utterance.lang = 'uz-UZ';
        } else if (lang.startsWith('ru')) {
            utterance.lang = 'ru-RU';
        } else {
            utterance.lang = 'en-US';
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            if (onEndCallback) onEndCallback();
        };

        utterance.onerror = () => {
            if (onEndCallback) onEndCallback();
        };

        this.synth.speak(utterance);
    }

    stopSpeaking() {
        if (this.synth) this.synth.cancel();
    }

    // Speech-To-Text (Microphone Input)
    initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            this.recognition = new SpeechRec();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'uz-UZ';
        }
    }

    startListening(onResultCallback, onEndCallback) {
        if (!this.recognition) {
            alert("Kechirasiz, brauzeringiz ovozli kiritishni qo'llab-quvvatlamaydi.");
            return;
        }

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onResultCallback) onResultCallback(transcript);
        };

        this.recognition.onend = () => {
            if (onEndCallback) onEndCallback();
        };

        this.recognition.onerror = (err) => {
            console.error("Speech Recognition Error:", err);
            if (onEndCallback) onEndCallback();
        };

        this.recognition.start();
    }
}

window.AudioManager = AudioManager;
