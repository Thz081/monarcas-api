const express = require('express');
const { createCanvas, registerFont, loadImage } = require('canvas');
const path = require('path');
const app = express();

try {
    registerFont(path.join(__dirname, 'PressStart2P-Regular.ttf'), { family: 'RetroFont' });
} catch (e) { console.log("Erro na fonte"); }

app.get('/api/teste', async (req, res) => {
    try {
        const { nome, classe, xp, maxxp, hp, maxhp, mp, money, str, vit, dex, intel, pfp } = req.query;
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
        ctx.fillText(`CLASSE: ${classe}`, 40, 95);

        // STATUS LADO ESQUERDO
        ctx.fillStyle = '#fff';
        ctx.font = '10px "RetroFont"';
        ctx.fillText(`MOEDAS: ${money} | VIT: ${vit}`, 40, 130);
        ctx.fillText(`FOR: ${str} | DEX: ${dex} | INT: ${intel}`, 40, 155);

        // FUNÇÃO DE BARRAS
        const drawBar = (x, y, val, max, color, label) => {
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, 300, 25);
            const width = (parseInt(val) / parseInt(max)) * 300;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width > 300 ? 300 : width, 25);
            ctx.fillStyle = '#fff';
            ctx.font = '10px "RetroFont"';
            ctx.fillText(`${label}: ${val}/${max}`, x + 5, y + 18);
        };

        drawBar(50, 200, hp, maxhp, '#2ecc71', 'HP');
        drawBar(50, 250, xp, maxxp, '#ff4d4d', 'XP');
        drawBar(50, 300, mp, 200, '#3498db', 'MP'); // Mana Máx padrão 200

        // AVATAR (LADO DIREITO)
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
            } catch (e) { console.log("Erro na foto"); }
        }


        // 2. SPRITE DA CLASSE (O MINI PERSONAGEM)
        try {
            // Ele tenta carregar a imagem com o nome da classe (ex: necromante.png)
            const spritePath = path.join(__dirname, `${classe.toLowerCase()}.png`);
            const spriteClasse = await loadImage(spritePath);
            
            // Desenha o bonequinho no espaço abaixo da foto do perfil
            // Ajustei as coordenadas (420, 190) para ele ficar centralizado no lado direito
            ctx.drawImage(spriteClasse, 420, 190, 150, 150); 
            
            console.log(`Sprite carregado: ${classe}`);
        } catch (e) {
            console.log(`Aviso: Sprite para ${classe} não encontrado. Certifique-se de que o arquivo ${classe.toLowerCase()}.png está na pasta api.`);
            
            // Opcional: Desenha um "default.png" ou uma sombra se não achar a classe
            ctx.fillStyle = '#ffffff11';
            ctx.font = '8px "RetroFont"';
            ctx.fillText("SEM SPRITE", 450, 260);
        }

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = app;
