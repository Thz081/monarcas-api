
const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');
const app = express();

try {
    registerFont(path.join(__dirname, 'PressStart2P-Regular.ttf'), { family: 'RetroFont' });
} catch (e) { console.log("Erro na fonte"); }

app.get('/api/teste', async (req, res) => {
    try {
        const { nome, classe, level, xp, maxxp, hp, maxhp, mp, maxmp, money, str, vit, dex, intel, pfp } = req.query;
        
        // Aumentamos o canvas para caber tudo (600x400)
        const canvas = createCanvas(600, 400);
        const ctx = canvas.getContext('2d');

        // FUNDO E BORDA
        ctx.fillStyle = '#0f0c29';
        ctx.fillRect(0, 0, 600, 400);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 580, 380);

        // CABEÇALHO
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "RetroFont"';
        ctx.fillText(`HEROI: ${nome}`, 40, 60);
        ctx.fillStyle = '#4db8ff';
        ctx.font = '14px "RetroFont"';
        ctx.fillText(`CLASSE: ${classe}`, 40, 90);

        // TEXTO DE STATUS (LADO ESQUERDO)
        ctx.fillStyle = '#fff';
        ctx.font = '10px "RetroFont"';
        ctx.fillText(`MOEDAS: ${money} | VIT: ${vit}`, 40, 120);
        ctx.fillText(`FOR: ${str} | DEX: ${dex} | INT: ${intel}`, 40, 140);

        // FUNÇÃO PARA DESENHAR BARRAS
        const drawBar = (x, y, val, max, color, label) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, 300, 25);
            const width = (parseInt(val) / parseInt(max)) * 300;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width > 300 ? 300 : width, 25);
            ctx.fillStyle = '#fff';
            ctx.font = '10px "RetroFont"';
            ctx.fillText(`${label}`, x - 35, y + 18);
        };

        // BARRAS DO SEU DESENHO
        drawBar(50, 200, hp, maxhp, '#2ecc71', 'HP');
        drawBar(50, 250, xp, maxxp, '#ff4d4d', 'XP');
        drawBar(50, 300, mp, maxmp, '#3498db', 'MP');

        // ÁREA DO PERSONAGEM (DIREITA)
        // 1. Foto do Jogador (Círculo no topo direito)
        if (pfp) {
            try {
                const imgPfp = await loadImage(pfp);
                ctx.save();
                ctx.beginPath();
                ctx.arc(480, 100, 60, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(imgPfp, 420, 40, 120, 120);
                ctx.restore();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
            } catch (e) { console.log("Erro pfp"); }
        }

        // 2. Placeholder para Personagem da Classe
        ctx.fillStyle = '#ffffff22';
        ctx.fillRect(400, 180, 150, 150);
        ctx.fillStyle = '#fff';
        ctx.font = '8px "RetroFont"';
        ctx.fillText("SPRITE CLASSE", 410, 260);

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = app;
