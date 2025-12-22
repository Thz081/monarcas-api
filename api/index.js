const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const path = require('path');
const app = express();

// O segredo está aqui: o nome tem que ser igualzinho ao do arquivo no GitHub
try {
    registerFont(path.join(__dirname, 'PressStart2P-Regular.ttf'), { family: 'RetroFont' });
    console.log("Fonte carregada com sucesso!");
} catch (e) {
    console.log("Erro ao carregar fonte:", e.message);
}

app.get('/api/teste', (req, res) => {
    try {
        const { nome, classe, level, xp, maxxp } = req.query;
        const canvas = createCanvas(600, 300);
        const ctx = canvas.getContext('2d');

        // FUNDO (Aquele gradiente que já funcionou)
        const grd = ctx.createLinearGradient(0, 0, 0, 300);
        grd.addColorStop(0, "#0f0c29");
        grd.addColorStop(1, "#24243e");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 600, 300);

        // BORDA
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 580, 280);

        // TEXTO (Agora usando 'RetroFont')
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "RetroFont"'; // Fonte pixelada
        ctx.fillText(`HEROI: ${nome || 'PLAYER'}`, 40, 70);
        
        ctx.font = '15px "RetroFont"';
        ctx.fillStyle = '#4db8ff';
        ctx.fillText(`CLASSE: ${classe || 'MAGO'}`, 40, 120);

        // BARRA DE XP (O visual que você já acertou!)
        ctx.fillStyle = '#444';
        ctx.fillRect(40, 200, 520, 30);
        
        const perc = (parseInt(xp) / parseInt(maxxp)) * 520 || 0;
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(40, 200, perc, 30);

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (err) {
        res.status(500).send('Erro: ' + err.message);
    }
});

module.exports = app;
