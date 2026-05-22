// 📂 api/index.js (VERSÃO TURBINADA E ANTI-QUEDA 🚀)
const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');
const app = express();

// Carregar Fonte
try {
    registerFont(path.join(__dirname, 'PressStart2P-Regular.ttf'), { family: 'RetroFont' });
} catch (e) { console.log("Erro na fonte: " + e.message); }

// Helper Imagens
const getImg = (nomeArquivo) => {
    const caminho = path.join(__dirname, 'assets', nomeArquivo);
    if (fs.existsSync(caminho)) return caminho;
    return null;
};

// 🚀 OTIMIZAÇÃO 1: CACHE DE IMAGENS NA RAM (Impede a Vercel de fritar)
const imageCache = new Map();
async function getCachedImage(imgName) {
    if (imageCache.has(imgName)) return imageCache.get(imgName);
    
    let imgPath = getImg(imgName);
    if (!imgPath) return null;
    
    try {
        let img = await loadImage(imgPath);
        imageCache.set(imgName, img); // Salva na memória
        return img;
    } catch (e) {
        return null;
    }
}

// ==========================================
// 👤 ROTA 1: PERFIL (LAYOUT AJUSTADO)
// ==========================================
app.get('/api/teste', async (req, res) => {
    try {
        const { nome, classe, nivel, xp, maxxp, hp, maxhp, mp, money, str, vit, dex, intel, pfp } = req.query;
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');

        // Fundo
        ctx.fillStyle = '#0f0c29'; ctx.fillRect(0, 0, 600, 400);
        
        let bg = await getCachedImage(`bg_${classe.toLowerCase()}.png`);
        if (bg) {
            ctx.drawImage(bg, 0, 0, 600, 400);
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, 600, 400);
        }

        // Borda
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 10; ctx.strokeRect(10, 10, 580, 380);

        // --- TEXTOS ---
        ctx.fillStyle = '#ffffff'; 
        ctx.font = '20px "RetroFont"'; 
        ctx.fillText(`HEROI: ${(nome || 'Desconhecido').substring(0,15)}`, 40, 50);

        ctx.fillStyle = '#4db8ff'; 
        ctx.font = '14px "RetroFont"';
        ctx.fillText(`CLASSE: ${classe || 'Desconhecida'}`, 40, 80); 
        
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`NÍVEL: ${nivel || "1"}`, 40, 105);

        ctx.fillStyle = '#fff'; 
        ctx.font = '10px "RetroFont"';
        ctx.fillText(`MOEDAS: ${money||0} | VIT: ${vit||5}`, 40, 135);
        ctx.fillText(`FOR: ${str||5} | DEX: ${dex||5} | INT: ${intel||5}`, 40, 160);

        // Barras
        const drawBar = (x, y, val, max, color, label) => {
            ctx.fillStyle = '#333'; ctx.fillRect(x, y, 300, 25);
            let m = parseInt(max)||100; let v = parseInt(val)||0;
            const w = (v/m)*300;
            ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, Math.min(w, 300)), 25);
            ctx.fillStyle = '#fff'; ctx.font = '10px "RetroFont"'; ctx.fillText(`${label}: ${v}/${m}`, x + 5, y + 18);
        };
        drawBar(50, 200, hp, maxhp, '#2ecc71', 'HP');
        drawBar(50, 250, xp, maxxp, '#ff4d4d', 'XP');
        drawBar(50, 300, mp, req.query.maxmp || 200, '#3498db', 'MP'); // Corrigido suporte a MaxMp

        // Avatar (Sem cache pois a url vem do whatsapp)
        if (pfp) {
            try {
                const imgPfp = await loadImage(pfp);
                ctx.save(); ctx.beginPath(); ctx.arc(480, 110, 70, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
                ctx.drawImage(imgPfp, 410, 40, 140, 140); ctx.restore(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
            } catch (e) {}
        }
        
        // Sprite Classe
        let sp = await getCachedImage(`${(classe || 'campones').toLowerCase()}.png`) || await getCachedImage('campones.png');
        if (sp) { ctx.drawImage(sp, 420, 190, 150, 150); }
        else { ctx.fillStyle='#fff'; ctx.fillText("?", 480, 250); }

        // 🚀 OTIMIZAÇÃO 2: Cache Edge da Vercel (Guarda no servidor por 60s)
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.setHeader('Content-Type', 'image/png'); 
        res.send(canvas.toBuffer());
    } catch (err) { res.status(500).send("Erro: " + err.message); }
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

        // 1. BACKGROUND
        let bgNome = 'floresta.jpg'; 
        if (local === 'dungeon') bgNome = 'corredor.png';
        else if (local) bgNome = `${local.toLowerCase()}.png`;

        if (eventoLower === 'entrada') bgNome = 'entrada.png';

        let background = await getCachedImage(bgNome) || await getCachedImage('floresta.jpg');
        
        if (background) {
            ctx.drawImage(background, 0, 0, 600, 400);
        } else {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,400);
        }

        if (local === 'dungeon' && eventoLower !== 'entrada') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.fillRect(0, 0, 600, 400);
        }

        // 2. DESENHO DOS ELEMENTOS
        const listaEventos = ['entrada', 'bau', 'armadilha', 'corredor', 'vazio'];
        const isEvento = listaEventos.includes(eventoLower);

        let spriteAlvo = await getCachedImage(`${eventoLower}.png`) || await getCachedImage('goblin.png');

        if (isEvento) {
            if ((eventoLower === 'bau' || eventoLower === 'armadilha') && spriteAlvo) {
                ctx.drawImage(spriteAlvo, 225, 200, 150, 150);
            }
            if (pet) {
                let spritePet = await getCachedImage(`${pet.toLowerCase()}.png`);
                if (spritePet) ctx.drawImage(spritePet, 250, 300, 80, 80);
            }
        } else {
            // A. PLAYER
            let spritePlayer = await getCachedImage(`${(classe || 'campones').toLowerCase()}.png`) || await getCachedImage('campones.png');
            if (spritePlayer) ctx.drawImage(spritePlayer, 50, 200, 150, 150);

            // B. PET
            if (pet) {
                let spritePet = await getCachedImage(`${pet.toLowerCase()}.png`);
                if (spritePet) ctx.drawImage(spritePet, 130, 280, 80, 80);
            }

            // Barra HP Player
            ctx.fillStyle = '#333'; ctx.fillRect(50, 180, 150, 15);
            const widthP = (parseInt(hp||100) / parseInt(maxhp||100)) * 150;
            ctx.fillStyle = '#2ecc71'; ctx.fillRect(50, 180, Math.max(0, Math.min(widthP, 150)), 15);
            ctx.fillStyle = '#fff'; ctx.font = '10px "RetroFont"'; ctx.fillText((nome||'Desconhecido').substring(0,15), 50, 170);

            // C. MONSTRO
            if (spriteAlvo) ctx.drawImage(spriteAlvo, 400, 200, 150, 150);

            // Barra HP Monstro
            ctx.fillStyle = '#333'; ctx.fillRect(400, 180, 150, 15);
            const widthM = (parseInt(hpmonstro||100) / parseInt(maxhpmonstro||100)) * 150;
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(400, 180, Math.max(0, Math.min(widthM, 150)), 15);
            ctx.fillStyle = '#fff'; ctx.fillText((monstro||'INIMIGO').toUpperCase(), 400, 170);

            // VS
            ctx.fillStyle = '#ffd700'; ctx.font = '30px "RetroFont"'; ctx.fillText("VS", 270, 250);
        }

        // 🚀 OTIMIZAÇÃO 2: Cache Edge da Vercel
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());

    } catch (err) {
        res.status(500).send("Erro API: " + err.message);
    }
});

module.exports = app;
