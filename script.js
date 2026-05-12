 // --- 1. KONFIGURASI UTAMA ---
const GROQ_API_KEY = "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"; 

const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const music = document.getElementById('bgMusic');

// --- 2. FUNGSI MUSIK OTOMATIS (AUTOPLAY FIX) ---
// Browser melarang musik putar sendiri tanpa klik. 
// Fungsi ini akan menjalankan musik pada klik pertama pengguna.
function aktifkanMusik() {
    if (music && music.paused) {
        music.play().then(() => {
            music.volume = 0.3; // Volume 30% agar nyaman
            console.log("Musik latar aktif.");
        }).catch(err => console.log("Menunggu interaksi untuk musik..."));
    }
}

// Jalankan musik saat klik pertama di mana saja atau saat kirim pesan
document.body.addEventListener('click', aktifkanMusik, { once: true });

// --- 3. FUNGSI API GROQ (MULTI-MODEL FALLBACK) ---
async function panggilAI(pesanUser) {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    
    // Daftar model terbaru 2026 yang paling stabil
    const daftarModel = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    
    for (let modelName of daftarModel) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { 
                            role: "system", 
                            content: "Kamu adalah Mahiru Shiina dari Otonari no Tenshi. Kamu sopan, lembut, dan sangat perhatian. Jawablah dengan hangat sebagai Mahiru." 
                        },
                        { role: "user", content: pesanUser }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0].message) {
                return data.choices[0].message.content;
            }

            // Jika model ini decommissioned/error, lanjut ke model berikutnya
            if (data.error) continue;

        } catch (error) {
            console.error("Gagal mencoba model: " + modelName);
        }
    }
    return "Maaf, sepertinya aku sedang lelah. Bisa kita bicara sebentar lagi?";
}

// --- 4. LOGIKA UI (BUBBLE CHAT) ---
function tambahPesan(teks, tipe) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = tipe === 'user' ? 'flex-end' : 'flex-start';
    wrapper.style.marginBottom = '15px';

    const bubble = document.createElement('div');
    bubble.innerText = teks;
    bubble.style.padding = '12px 18px';
    bubble.style.borderRadius = '18px';
    bubble.style.maxWidth = '80%';
    bubble.style.fontSize = '14px';
    bubble.style.lineHeight = '1.5';
    bubble.style.wordWrap = 'break-word';
    
    if (tipe === 'user') {
        bubble.style.background = '#d4a373'; // Warna estetik user
        bubble.style.color = 'white';
        bubble.style.borderRadius = '18px 18px 0 18px';
    } else {
        bubble.style.background = '#ffffff'; // Warna estetik Mahiru
        bubble.style.color = '#444';
        bubble.style.border = '1px solid #eee';
        bubble.style.borderRadius = '18px 18px 18px 0';
    }

    wrapper.appendChild(bubble);
    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return bubble;
}

// --- 5. HANDLING PESAN ---
async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // Pastikan musik aktif saat interaksi pesan pertama
    aktifkanMusik();

    tambahPesan(text, 'user');
    userInput.value = '';

    const botMsg = tambahPesan("...", 'bot');
    const jawaban = await panggilAI(text);
    
    botMsg.innerText = jawaban;
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// --- 6. EVENT LISTENERS ---
// Klik tombol kirim
sendBtn.onclick = (e) => {
    e.preventDefault();
    handleChat();
};

// Tekan Enter untuk kirim
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        handleChat();
    }
});

console.log("Script Final v2026 Aktif!");