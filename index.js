const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ваш секретный ключ для админки
const ADMIN_SECRET = "seraphim123";

// База данных валидных ключей
const keysDatabase = [
    { key: "SERAPH-PREMIUM-2026", status: "Active" }
];

// Ваш Luau-скрипт, который будет отдаваться в Roblox
const MY_ROBLOX_SCRIPT = `
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Seraphica Hub",
        Text = "Успешно загружено! Welcome, Seraphim!",
        Duration = 5
    })
    print("Seraphica Hub Active!")
`;

// 1. ВЕБ-САЙТ (Главная страница и Админка)
app.get('/', (req, res) => {
    const isAdmin = req.query.admin === ADMIN_SECRET;

    // Обычная страница для остальных пользователей
    if (!isAdmin) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Seraphica</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { background-color: #000000; overflow: hidden; }
                    .neon-purple {
                        color: #c084fc;
                        text-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 20px #9333ea, 0 0 40px #7e22ce, 0 0 80px #6b21a8;
                        animation: pulseGlow 2.5s infinite alternate ease-in-out;
                    }
                    @keyframes pulseGlow {
                        0% { opacity: 0.75; transform: scale(0.98); }
                        100% { opacity: 1; transform: scale(1.02); }
                    }
                </style>
            </head>
            <body class="h-screen w-screen flex justify-center items-center font-sans">
                <div class="absolute w-80 h-80 bg-purple-900/20 rounded-full blur-3xl pointer-events-none"></div>
                <div class="neon-purple text-center px-6 text-xl sm:text-2xl md:text-3xl font-black tracking-widest uppercase select-none">
                    This site just for execute code...
                </div>
            </body>
            </html>
        `);
    }

    // Личный кабинет админа (при ?admin=seraphim123)
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Seraphica Hub Admin</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body { background-color: #000000; color: #a855f7; font-family: sans-serif; }
                .neon-title { color: #d8b4fe; text-shadow: 0 0 10px #a855f7, 0 0 25px #9333ea, 0 0 50px #7e22ce; }
                .plus-btn {
                    background: #000000;
                    border: 2px solid #a855f7;
                    color: #a855f7;
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
                    transition: all 0.3s ease;
                }
                .plus-btn:hover { transform: scale(1.1) rotate(90deg); background: #a855f7; color: #000; }
                .glass-card { background: rgba(10, 0, 18, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(168, 85, 247, 0.3); }
            </style>
        </head>
        <body class="min-h-screen flex flex-col justify-between items-center p-6 relative overflow-x-hidden">
            <header class="w-full max-w-2xl flex justify-between items-center py-4 border-b border-purple-900/40">
                <span class="text-xs font-bold tracking-widest text-purple-400 uppercase">Seraphica System</span>
                <span class="text-xs font-mono text-purple-400/60">ONLINE</span>
            </header>

            <main class="w-full max-w-xl my-auto flex flex-col items-center text-center gap-8 py-8">
                <div>
                    <h1 class="text-3xl sm:text-5xl font-black tracking-wide neon-title mb-2">Welcome, Seraphim!</h1>
                    <p class="text-purple-400/60 text-xs sm:text-sm">Панель управления скриптами и доступом</p>
                </div>

                <button onclick="openModal()" class="plus-btn w-20 h-20 rounded-full flex justify-center items-center text-3xl cursor-pointer">
                    <i class="fa-solid fa-plus"></i>
                </button>

                <div class="w-full glass-card p-5 rounded-2xl text-left">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-purple-300 uppercase">Загрузчик:</span>
                        <button onclick="copyLoader()" class="text-xs text-purple-400 hover:text-white"><i class="fa-solid fa-copy"></i> Скопировать</button>
                    </div>
                    <code id="loaderText" class="block bg-black/80 p-3 rounded-xl text-purple-300 font-mono text-xs break-all border border-purple-900/50">
                        loadstring(game:HttpGet("https://seraphica.duckdns.org/api/script?key=SERAPH-PREMIUM-2026"))()
                    </code>
                </div>

                <div class="w-full glass-card p-5 rounded-2xl text-left">
                    <h3 class="text-xs font-bold uppercase text-purple-300 mb-4 flex justify-between">
                        <span>Созданные ключи</span><i class="fa-solid fa-key"></i>
                    </h3>
                    <div id="keyList" class="space-y-2 font-mono text-xs">
                        ${keysDatabase.map(k => `
                            <div class="p-3 bg-black/60 rounded-xl border border-purple-900/40 flex justify-between items-center">
                                <span class="text-purple-200">${k.key}</span>
                                <span class="px-2 py-0.5 bg-purple-950 text-purple-300 rounded text-[10px]">${k.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </main>

            <div id="modal" class="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center p-4 hidden z-50">
                <div class="glass-card w-full max-w-md p-6 rounded-2xl relative">
                    <button onclick="closeModal()" class="absolute top-4 right-4 text-purple-400"><i class="fa-solid fa-xmark text-xl"></i></button>
                    <h2 class="text-lg font-bold text-purple-200 mb-4">Создать ключ доступа</h2>
                    <input type="text" id="keyInput" placeholder="Введите название ключа" class="w-full bg-black/80 border border-purple-500/40 rounded-xl p-3 text-sm text-purple-200 focus:outline-none mb-4">
                    <button onclick="addKey()" class="w-full bg-purple-600 text-black font-bold py-3 rounded-xl">Сгенерировать</button>
                </div>
            </div>

            <script>
                function openModal() { document.getElementById('modal').classList.remove('hidden'); }
                function closeModal() { document.getElementById('modal').classList.add('hidden'); }
                function copyLoader() {
                    navigator.clipboard.writeText(document.getElementById('loaderText').innerText.trim());
                    alert('Скопировано!');
                }
                function addKey() {
                    const input = document.getElementById('keyInput');
                    const keyName = input.value.trim() || 'SERAPH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                    const list = document.getElementById('keyList');
                    const newItem = document.createElement('div');
                    newItem.className = 'p-3 bg-black/60 rounded-xl border border-purple-900/40 flex justify-between items-center';
                    newItem.innerHTML = `<span class="text-purple-200">\${keyName}</span><span class="px-2 py-0.5 bg-purple-950 text-purple-300 rounded text-[10px]">Active</span>`;
                    list.appendChild(newItem);
                    input.value = '';
                    closeModal();
                }
            </script>
        </body>
        </html>
    `);
});

// 2. API ЭНДПОИНТ ДЛЯ ROBLOX
app.get('/api/script', (req, res) => {
    const userKey = req.query.key;
    const keyExists = keysDatabase.some(k => k.key === userKey);

    res.setHeader('Content-Type', 'text/plain');
    if (!userKey || !keyExists) {
        return res.send(`warn("Seraphica: Invalid Key")`);
    }
    res.send(MY_ROBLOX_SCRIPT);
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
