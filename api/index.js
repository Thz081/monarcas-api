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


        // TEXTOS
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px "RetroFont"';
        ctx.fillText(`HEROI: ${nome}`, 40, 60);
        
        ctx.font = '12px "RetroFont"';
        ctx.fillStyle = '#4db8ff';
        ctx.fillText(`CLASSE: ${classe}`, 40, 95);

        // BARRA DE VIDA (HP)
        ctx.fillStyle = '#333'; ctx.fillRect(40, 130, 250, 20); // Fundo
        const percHP = (parseInt(req.query.hp) / parseInt(req.query.maxhp)) * 250;
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(40, 130, percHP, 20); // Verde
        ctx.fillStyle = '#fff'; ctx.font = '10px "RetroFont"';
        ctx.fillText(`HP: ${req.query.hp}`, 45, 145);

        // BARRA DE MANA (MP)
        ctx.fillStyle = '#333'; ctx.fillRect(40, 165, 250, 20);
        const percMP = (parseInt(req.query.mp) / 200) * 250; // Supus 200 como MP max
        ctx.fillStyle = '#3498db'; ctx.fillRect(40, 165, percMP, 20); // Azul
        ctx.fillText(`MP: ${req.query.mp}`, 45, 180);

        // BARRA DE XP (Embaixo)
        ctx.fillStyle = '#333'; ctx.fillRect(40, 230, 520, 15);
        const percXP = (parseInt(xp) / parseInt(maxxp)) * 520;
        ctx.fillStyle = '#f1c40f'; ctx.fillRect(40, 230, percXP, 15); // Amarelo XP
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
