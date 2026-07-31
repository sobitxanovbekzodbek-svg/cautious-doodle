/* ==========================================================================
   AURA 3D — AI RESPONSE ENGINE (INTELLIGENT KNOWLEDGE & API INTEGRATION)
   ========================================================================== */

class AIEngine {
    constructor() {
        this.provider = localStorage.getItem('aura_api_provider') || 'simulated';
        this.apiKey = localStorage.getItem('aura_api_key') || '';
        this.currentPersona = 'general';
        this.currentLang = 'uz';

        // Persona System Prompts
        this.personaPrompts = {
            general: "Siz AURA 3D – zamonaviy 3D animatsiyali va aqlli o'zbekcha Sun'iy Intellekt yordamchisiz.",
            developer: "Siz Dev Master – tajribali Senior Dasturchisiz. Web dasturlash, Three.js, JavaScript, Python va algoritmlar bo'yicha sifatli kod va tushuntirish berasiz.",
            designer: "Siz Visual Artist – 3D dizayner va UI/UX mutaxassisiz. Ranglar balansi, 3D vizualizatsiya va zamonaviy web dizayn bo'yicha maslahat berasiz.",
            tutor: "Siz Prof. Nexus – tajribali ustoz va olimsiz. Ilm-fan va texnologiyalarni o'zbek tilida sodda va qiziqarli tushuntirasiz."
        };
    }

    setPersona(personaKey) {
        if (this.personaPrompts[personaKey]) {
            this.currentPersona = personaKey;
        }
    }

    setLanguage(lang) {
        this.currentLang = lang;
    }

    setApiConfig(provider, apiKey) {
        this.provider = provider;
        this.apiKey = apiKey;
        localStorage.setItem('aura_api_provider', provider);
        localStorage.setItem('aura_api_key', apiKey);
    }

    async generateResponse(userMessage, chatHistory = []) {
        // If API key provided, attempt real API call
        if (this.provider === 'openai' && this.apiKey) {
            return await this.callOpenAI(userMessage, chatHistory);
        } else if (this.provider === 'gemini' && this.apiKey) {
            return await this.callGemini(userMessage, chatHistory);
        }

        // Default: High quality intelligent simulated responses
        return await this.simulatedAIResponse(userMessage);
    }

    // OpenAI API Integratsiyasi
    async callOpenAI(prompt, history) {
        try {
            const systemContent = this.personaPrompts[this.currentPersona];
            const messages = [
                { role: 'system', content: systemContent },
                ...history.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                })),
                { role: 'user', content: prompt }
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'OpenAI API ulanishda xatolik');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI Error:', error);
            return `⚠️ OpenAI API Xatoligi: ${error.message}. Hozircha simulyatsiya rejimiga o'tildi.\n\n` + await this.simulatedAIResponse(prompt);
        }
    }

    // Google Gemini API Integratsiyasi
    async callGemini(prompt, history) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${this.personaPrompts[this.currentPersona]}\n\nUser: ${prompt}` }] }]
                })
            });

            if (!response.ok) throw new Error('Gemini API bilan ulanib bo\'lmadi');
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini Error:', error);
            return `⚠️ Gemini API Xatoligi: ${error.message}.\n\n` + await this.simulatedAIResponse(prompt);
        }
    }

    // Intelligent Uzbek AI Response Simulator
    async simulatedAIResponse(prompt) {
        // Simulate thinking latency
        await new Promise(res => setTimeout(res, 800 + Math.random() * 800));

        const lowerPrompt = prompt.toLowerCase();

        // 1. Dasturlash & Three.js maslahatlari
        if (lowerPrompt.includes('three.js') || lowerPrompt.includes('3d o\'yin') || lowerPrompt.includes('3d game')) {
            return `### 🚀 Three.js va JavaScript yordamida 3D Web Dasturlash

Three.js kutubxonasi yordamida brauzerda real-vaqtdagi 3D grafika yaratish juda oson. Mana siz uchun minimal tayyor namuna:

\`\`\`javascript
import * as THREE from 'three';

// 1. Sahna va Kamera yaratish
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. 3D Kub (Cube) obyektini qo'shish
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// 3. Render animatsiya sikli
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
\`\`\`

**Muhim Maslahatlar:**
- **OrbitControls**: Kamerani sichqoncha bilan aylantirish uchun foydalaning.
- **Lighting**: MeshStandardMaterial bilan ishlaganda PointLight yoki AmbientLight qo'shishni unutmang!`;
        }

        // 2. AI va 3D Kelajagi
        if (lowerPrompt.includes('kelajak') || lowerPrompt.includes('ai va 3d') || lowerPrompt.includes('sun\'iy intellekt')) {
            return `### 🌟 Sun'iy Intellekt va 3D Grafika Kelajagi

AI va 3D texnologiyalarning uyg'unlashuvi raqamli dunyoda yangi davrni ochmoqda:

1. **Generativ 3D Modellashtirish**: Endi matnli so'rov (prompt) orqali soniyalar ichida 3D ob'ektlar va dunyolar yaratilmoqda.
2. **Real-Vaqtdagi Interaktiv Avatarlar**: Hozir siz ko'rib turgan **AURA 3D** avatari kabi, AI javob berayotganda 3D animatsiyalar real-vaqtda holatini va his-tuyg'usini o'zgartiradi.
3. **WebGPU inqilobi**: Veb-brauzerlarda AAA darajasidagi 3D grafikani ishlatish imkoniyati paydo bo'ldi.

Siz ham ushbu sohada o'z loyihalaringizni boshlashingiz mumkin!`;
        }

        // 3. Dasturlash Maslahatlari
        if (lowerPrompt.includes('dasturlash') || lowerPrompt.includes('maslahat') || lowerPrompt.includes('o\'rganish')) {
            return `### 💡 Dasturlashni Samarali O'rganish Uchun 5 Ta Maslahat

1. **Asoslarni Mustahkamlang**: HTML, CSS, JavaScript va Data Structures asoslarini yaxshi o'rganing.
2. **Amaliyot (Project-Based Learning)**: Nazariyadan ko'ra ko me ko'proq kichik loyihalar (Kalkulyator, Todo, 3D Chat) qiling.
3. **Clean Code Tamoyillari**: Kodlaringizni tushunarli, modulli va izohli yozishga odatlaning.
4. **Git va GitHub**: Versiyalar nazoratini mukammal o'rganing.
5. **Sun'iy Intellektdan Yordamchi Sifatida Foydalaning**: AI siz o'rniga yozmasin, balki xatolaringizni tushunishga yordam bersin!`;
        }

        // 4. Ijodiy She'r
        if (lowerPrompt.includes('she\'r') || lowerPrompt.includes('sher') || lowerPrompt.includes('ijod')) {
            return `✨ **Kiber Dunyo va AURA 3D**

Nurlarga burangan nurli kelajak,
Kiber fazolardan keladi sado.
AURA 3D ila suhbat qursang gar,
Savolingizga tez bergaydir davo.

Raqamlar raqsi-yu, kodlar jilvasi,
Bari birlashibdi bir nuqtada jam.
Sun'iy intellektning har bir zarrasi,
Kelajak sari bir dadil tashlangan qadam!`;
        }

        // Persona ga mos umumiy javoblar
        const personaResponses = {
            general: [
                `Ajoyib savol! **AURA 3D** tizimi sifatida sizga yordam berishdan mamnunman. Ushbu mavzu bo'yicha ko'proq ma'lumot olishni istasangiz, savolingizni batafsilroq berishingiz mumkin!`,
                `Sizning so'rovingiz tahlil qilindi. 3D interaktiv rejimimizda har qanday g'oya va loyihani birgalikda muhokama qilishimiz mumkin. Nimalarni bilishni istaysiz?`,
                `Bu juda qiziqarli! Sun'iy intellekt va zamonaviy web texnologiyalari ushbu masalani juda tez hal qilishga imkon beradi.`
            ],
            developer: [
                `👨‍💻 **Dev Master**: Dasturlash arxitekturasi va kod mantig'i nuqtai nazaridan yondashsak, bu masalani modular va saqlash oson bo'lgan usulda hal qilish lozim. Qo'shimcha kod namunasi kerakmi?`,
                `Kod samadorligi (Performance) va algoritmik murakkablikni optimallashtirish uchun modern ES6+ hamda async/await metodlaridan foydalanishni tavsiya etaman.`
            ],
            designer: [
                `🎨 **Visual Artist**: Dizayn nuqtai nazaridan olganda, Glassmorphism, 3D Neon nurlanishi hamda moslashuvchan Grid layout orqali foydalanuvchi tajribasini (UX) 100% ga oshirish mumkin!`
            ],
            tutor: [
                `📚 **Prof. Nexus**: Kelgusi tushunchalarni oson tushunish uchun avvalo asosiy tushunchalarni ajratib olaylik. Har qanday murakkab fan sodda mantiqiy qismlardan tashkil topgan.`
            ]
        };

        const list = personaResponses[this.currentPersona] || personaResponses.general;
        return list[Math.floor(Math.random() * list.length)];
    }
}

window.AIEngine = AIEngine;
