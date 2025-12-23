const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');
const app = express();

try {
    registerFont(path.join(__dirname, 'PressStart2P-Regular.ttf'), { family: 'RetroFont' });
} catch (e) { console.log("Erro na fonte: " + e.message); }

const getImg = (nomeArquivo) => {
    const caminho = path.join(__dirname, 'assets', nomeArquivo);
    if (!fs.existsSync(caminho)) return null;
    return caminho;
};

// ... (Mantenha a rota /api/teste igual, focaremos na batalha) ...

app.get('/api/batalha', async (req, res) => {
    try {
        const { nome, classe, monstro, hp, maxhp, hpmonstro, maxhpmonstro, local } = req.query;
        
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');
        const eventoLower = monstro.toLowerCase();

        // =========================================
        // A. LÓGICA DE BACKGROUND (CORRIGIDA) 🖼️
        // =========================================
        let bgNome = 'floresta.jpg'; // Padrão

        // 1. Regra base do local
        if (local === 'dungeon') bgNome = 'corredor.png';
        else if (local) bgNome = `${local.toLowerCase()}.png`;

        // 2. 🚨 FIX: Se for ENTRADA, o fundo TEM QUE SER a entrada!
        // Assim ela substitui o corredor e preenche a tela.
        if (eventoLower === 'entrada') {
            bgNome = 'entrada.png';
        }

        let bgPath = getImg(bgNome);
        if (!bgPath) bgPath = getImg('floresta.jpg'); 

        try {
            const background = await loadImage(bgPath);
            ctx.drawImage(background, 0, 0, 600, 400);
        } catch (e) {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,400);
        }

        // Filtro escuro para clima de dungeon (exceto na entrada, pra ver os detalhes)
        if (local === 'dungeon' && eventoLower !== 'entrada') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, 600, 400);
        }

        // =========================================
        // B. LÓGICA DE DESENHO
        // =========================================
        const listaEventos = ['entrada', 'bau', 'armadilha', 'corredor', 'vazio'];
        const isEvento = listaEventos.includes(eventoLower);

        // Carrega Sprite (se precisar)
        let spriteAlvoPath = getImg(`${eventoLower}.png`);
        if (!spriteAlvoPath) spriteAlvoPath = getImg('goblin.png');
        const spriteAlvo = await loadImage(spriteAlvoPath);

        if (isEvento) {
            // --- MODO EVENTO ---
            
            // Só desenha sprite se for Objeto (Baú/Armadilha).
            // Se for ENTRADA, CORREDOR ou VAZIO, não desenha nada (o fundo já conta a história).
            if (eventoLower === 'bau' || eventoLower === 'armadilha') {
                ctx.drawImage(spriteAlvo, 225, 200, 150, 150);
            }
            
            // Texto descritivo opcional
            if (eventoLower === 'entrada') {
                ctx.fillStyle = '#ffffff'; 
                ctx.font = '20px "RetroFont"';
                ctx.textAlign = 'center';
                // ctx.fillText("ENTRADA DA MASMORRA", 300, 50); // Se quiser título
            }

        } else {
            // --- MODO COMBATE (PANCADARIA) ---
            
            // 1. Player
            let spritePlayerPath = getImg(`${classe.toLowerCase()}.png`);
            if (!spritePlayerPath) spritePlayerPath = getImg('campones.png');
            const spritePlayer = await loadImage(spritePlayerPath);
            ctx.drawImage(spritePlayer, 50, 200, 150, 150);

            // Barra HP Player
            ctx.fillStyle = '#333'; ctx.fillRect(50, 180, 150, 15);
            const widthP = (parseInt(hp) / parseInt(maxhp)) * 150;
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(50, 180, Math.max(0, widthP), 15);
            ctx.fillStyle = '#fff'; ctx.font = '10px "RetroFont"'; ctx.fillText(nome.substring(0,15), 50, 170);

            // 2. Monstro
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
        res.status(500).send("Erro API: " + err.message);
    }
});

module.exports = app;
