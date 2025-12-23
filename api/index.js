const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs'); // Importante para checar se arquivo existe
const app = express();

// 1. CARREGAR A FONTE
try {
    registerFont(path.join(__dirname, 'PressStart2P-Regular.ttf'), { family: 'RetroFont' });
} catch (e) { console.log("Erro na fonte: " + e.message); }

// 2. FUNÇÃO MÁGICA PARA PEGAR IMAGENS (COM PROTEÇÃO)
const getImg = (nomeArquivo) => {
    const caminho = path.join(__dirname, 'assets', nomeArquivo);
    // Se não existir, retorna um placeholder ou null
    if (!fs.existsSync(caminho)) return null;
    return caminho;
};

// ==========================================
// 👤 ROTA DO PERFIL (Mantida Igual)
// ==========================================
app.get('/api/teste', async (req, res) => {
    // ... (Mantenha o código do perfil que você já tem, ele está bom)
    // Se quiser, posso reenviar, mas focando na batalha abaixo:
    try {
        const { nome, classe, xp, maxxp, hp, maxhp, mp, money, str, vit, dex, intel, pfp } = req.query;
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');
        // ... (Lógica do Perfil) ...
        // Vou resumir pra não estourar o limite, mas mantenha o seu /api/teste original
        res.status(200).send("Use o perfil antigo aqui se quiser manter");
    } catch (e) {}
});

// ==========================================
// ⚔️ SISTEMA DE BATALHA INTELIGENTE (FIX VS ENTRADA)
// ==========================================
app.get('/api/batalha', async (req, res) => {
    try {
        const { nome, classe, monstro, hp, maxhp, hpmonstro, maxhpmonstro, local } = req.query;
        
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');

        // =========================================
        // A. DEFINIR O BACKGROUND CORRETO
        // =========================================
        let bgNome = 'floresta.jpg'; // Padrão
        
        // Se a local for dungeon, FORÇA o corredor
        if (local === 'dungeon') bgNome = 'corredor.png'; 
        else if (local) bgNome = `${local.toLowerCase()}.png`;

        let bgPath = getImg(bgNome);
        if (!bgPath) bgPath = getImg('floresta.jpg'); // Fallback final

        try {
            const background = await loadImage(bgPath);
            ctx.drawImage(background, 0, 0, 600, 400);
        } catch (e) {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,400); // Fundo preto se falhar tudo
        }

        // Escurecer um pouco pra dar clima
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, 600, 400);

        // =========================================
        // B. VERIFICAR SE É "EVENTO" OU "COMBATE"
        // =========================================
        // Lista de coisas que NÃO TEM barra de vida
        const listaEventos = ['entrada', 'bau', 'armadilha', 'corredor', 'vazio'];
        const isEvento = listaEventos.includes(monstro.toLowerCase());

        // Carrega Sprite do "Alvo" (Monstro ou Objeto)
        let spriteAlvoPath = getImg(`${monstro.toLowerCase()}.png`);
        if (!spriteAlvoPath) spriteAlvoPath = getImg('goblin.png'); // Fallback visual
        const spriteAlvo = await loadImage(spriteAlvoPath);


        if (isEvento) {
            // =====================================
            // MODO EVENTO (SÓ MOSTRA O OBJETO)
            // =====================================
            
            // Desenha o objeto centralizado
            if (monstro === 'entrada') {
                ctx.drawImage(spriteAlvo, 150, 50, 300, 300); // Porta Grande
            } else if (monstro === 'bau' || monstro === 'armadilha') {
                ctx.drawImage(spriteAlvo, 225, 200, 150, 150); // Objeto no chão
            }
            
            // NÃO DESENHA PLAYER, NÃO DESENHA BARRAS, NÃO DESENHA VS

        } else {
            // =====================================
            // MODO COMBATE (PANCADARIA CLASSICA)
            // =====================================

            // 1. DESENHAR PLAYER (ESQUERDA)
            let spritePlayerPath = getImg(`${classe.toLowerCase()}.png`);
            if (!spritePlayerPath) spritePlayerPath = getImg('campones.png');
            const spritePlayer = await loadImage(spritePlayerPath);
            
            ctx.drawImage(spritePlayer, 50, 200, 150, 150);

            // Barra HP Player
            ctx.fillStyle = '#333'; ctx.fillRect(50, 180, 150, 15);
            const widthP = (parseInt(hp) / parseInt(maxhp)) * 150;
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(50, 180, Math.max(0, widthP), 15);
            ctx.fillStyle = '#fff'; ctx.font = '10px "RetroFont"'; ctx.fillText(nome.substring(0,15), 50, 170);

            // 2. DESENHAR MONSTRO (DIREITA)
            ctx.drawImage(spriteAlvo, 400, 200, 150, 150);

            // Barra HP Monstro
            ctx.fillStyle = '#333'; ctx.fillRect(400, 180, 150, 15);
            const widthM = (parseInt(hpmonstro) / parseInt(maxhpmonstro)) * 150;
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(400, 180, Math.max(0, widthM), 15);
            ctx.fillStyle = '#fff'; ctx.fillText(monstro.toUpperCase(), 400, 170);

            // 3. VS
            ctx.fillStyle = '#ffd700';
            ctx.font = '30px "RetroFont"';
            ctx.fillText("VS", 270, 250);
        }

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());

    } catch (err) {
        res.status(500).send("Erro API Batalha: " + err.message);
    }
});

module.exports = app;
