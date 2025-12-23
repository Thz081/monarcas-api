// 📂 api/index.js (Versão Final com Nível no Perfil)
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
    if (fs.existsSync(caminho)) return caminho;
    return null;
};

// ==========================================
// 👤 ROTA DO PERFIL (COM NÍVEL AGORA!)
// ==========================================
app.get('/api/teste', async (req, res) => {
    try {
        // 👇 ADICIONEI 'nivel' AQUI
        const { nome, classe, nivel, xp, maxxp, hp, maxhp, mp, money, str, vit, dex, intel, pfp } = req.query;
        
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');

        // FUNDO
        ctx.fillStyle = '#0f0c29';
        ctx.fillRect(0, 0, 600, 400);
        
        try {
            let bgClasse = getImg(`bg_${classe.toLowerCase()}.png`);
            if (bgClasse) {
                const bg = await loadImage(bgClasse);
                ctx.drawImage(bg, 0, 0, 600, 400);
                ctx.fillStyle = 'rgba(0,0,0,0.7)'; 
                ctx.fillRect(0, 0, 600, 400);
            }
        } catch(e) {}

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 580, 380);

        // CABEÇALHO
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "RetroFont"';
        ctx.fillText(`HEROI: ${nome}`, 40, 60);
        
        ctx.fillStyle = '#4db8ff';
        ctx.font = '14px "RetroFont"';
        
        // 👇 AQUI TÁ A MUDANÇA VISUAL!
        // Se o nível veio (existe), mostra ele. Se não, mostra "1" pra não bugar.
        const nivelDisplay = nivel || "1";
        ctx.fillText(`CLASSE: ${classe} | NVL: ${nivelDisplay}`, 40, 95);

        // STATUS
        ctx.fillStyle = '#fff';
        ctx.font = '10px "RetroFont"';
        ctx.fillText(`MOEDAS: ${money} | VIT: ${vit}`, 40, 130);
        ctx.fillText(`FOR: ${str} | DEX: ${dex} | INT: ${intel}`, 40, 155);

        // BARRAS
        const drawBar = (x, y, val, max, color, label) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, 300, 25);
            let maxVal = parseInt(max) || 100;
            let curVal = parseInt(val) || 0;
            const width = (curVal / maxVal) * 300;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width > 300 ? 300 : Math.max(0, width), 25);
            ctx.fillStyle = '#fff';
            ctx.font = '10px "RetroFont"';
            ctx.fillText(`${label}: ${curVal}/${maxVal}`, x + 5, y + 18);
        };

        drawBar(50, 200, hp, maxhp, '#2ecc71', 'HP');
        drawBar(50, 250, xp, maxxp, '#ff4d4d', 'XP');
        drawBar(50, 300, mp, 200, '#3498db', 'MP'); 

        // AVATAR
        if (pfp) {
            try {
                const imgPfp = await loadImage(pfp);
                ctx.save();
                ctx.beginPath();
                ctx.arc(480, 110, 70, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(imgPfp, 410, 40, 140, 140);
                ctx.restore();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
            } catch (e) {}
        }

        // SPRITE CLASSE
        try {
            let spritePath = getImg(`${classe.toLowerCase()}.png`);
            if (!spritePath) spritePath = getImg('campones.png');
            if (spritePath) {
                const spriteClasse = await loadImage(spritePath);
                ctx.drawImage(spriteClasse, 420, 190, 150, 150); 
            }
        } catch (e) {
            ctx.fillStyle = '#ffffff'; ctx.fillText("?", 480, 250);
        }

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (err) { res.status(500).send(err.message); }
});

// ==========================================
// ⚔️ ROTA DE BATALHA & DUNGEON (/api/batalha)
// ==========================================
app.get('/api/batalha', async (req, res) => {
    try {
        const { nome, classe, monstro, hp, maxhp, hpmonstro, maxhpmonstro, local, pet } = req.query;
        
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');
        const eventoLower = monstro ? monstro.toLowerCase() : 'goblin';

        // 1. BACKGROUND (ENTRADA FIX)
        let bgNome = 'floresta.jpg'; 
        if (local === 'dungeon') bgNome = 'corredor.png';
        else if (local) bgNome = `${local.toLowerCase()}.png`;

        if (eventoLower === 'entrada') bgNome = 'entrada.png';

        let bgPath = getImg(bgNome);
        if (!bgPath) bgPath = getImg('floresta.jpg'); 

        try {
            const background = await loadImage(bgPath);
            ctx.drawImage(background, 0, 0, 600, 400);
        } catch (e) {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,400);
        }

        // Filtro escuro para dungeon (exceto entrada)
        if (local === 'dungeon' && eventoLower !== 'entrada') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, 600, 400);
        }

        // 2. DESENHO DOS ELEMENTOS
        const listaEventos = ['entrada', 'bau', 'armadilha', 'corredor', 'vazio'];
        const isEvento = listaEventos.includes(eventoLower);

        let spriteAlvoPath = getImg(`${eventoLower}.png`);
        if (!spriteAlvoPath) spriteAlvoPath = getImg('goblin.png');
        const spriteAlvo = await loadImage(spriteAlvoPath);

        if (isEvento) {
            // MODO EVENTO
            if (eventoLower === 'bau' || eventoLower === 'armadilha') {
                ctx.drawImage(spriteAlvo, 225, 200, 150, 150);
            }
            
            // 🐾 PET NO MODO EVENTO (Explorando)
            if (pet) {
                let spritePetPath = getImg(`${pet.toLowerCase()}.png`);
                if (spritePetPath) {
                    const spritePet = await loadImage(spritePetPath);
                    ctx.drawImage(spritePet, 250, 300, 80, 80);
                }
            }

        } else {
            // MODO COMBATE
            
            // A. PLAYER
            let spritePlayerPath = getImg(`${classe.toLowerCase()}.png`);
            if (!spritePlayerPath) spritePlayerPath = getImg('campones.png');
            const spritePlayer = await loadImage(spritePlayerPath);
            ctx.drawImage(spritePlayer, 50, 200, 150, 150);

            // B. PET (COMPANHEIRO) 🐾
            if (pet) {
                let spritePetPath = getImg(`${pet.toLowerCase()}.png`);
                if (spritePetPath) {
                    const spritePet = await loadImage(spritePetPath);
                    ctx.drawImage(spritePet, 130, 280, 80, 80);
                }
            }

            // Barra HP Player
            ctx.fillStyle = '#333'; ctx.fillRect(50, 180, 150, 15);
            const widthP = (parseInt(hp) / parseInt(maxhp)) * 150;
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(50, 180, Math.max(0, widthP), 15);
            ctx.fillStyle = '#fff'; ctx.font = '10px "RetroFont"'; ctx.fillText(nome.substring(0,15), 50, 170);

            // C. MONSTRO
            ctx.drawImage(spriteAlvo, 400, 200, 150, 150);

            // Barra HP Monstro
            ctx.fillStyle = '#333'; ctx.fillRect(400, 180, 150, 15);
            const widthM = (parseInt(hpmonstro) / parseInt(maxhpmonstro)) * 150;
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(400, 180, Math.max(0, widthM), 15);
            ctx.fillStyle = '#fff'; ctx.fillText(monstro ? monstro.toUpperCase() : "INIMIGO", 400, 170);

            // VS
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
