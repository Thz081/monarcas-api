const express = require('express');
const { createCanvas } = require('canvas');
const app = express();

app.get('/api/teste', (req, res) => {
    try {
        const { nome, classe, level } = req.query;
        
        // Canvas um pouco maior
        const canvas = createCanvas(600, 250);
        const ctx = canvas.getContext('2d');

        // 1. FUNDO COM GRADIENTE "MONARCAS"
        const grd = ctx.createLinearGradient(0, 0, 0, 250);
        grd.addColorStop(0, "#0f0c29");
        grd.addColorStop(0.5, "#302b63");
        grd.addColorStop(1, "#24243e");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 600, 250);

        // 2. BORDA ESTILIZADA
        ctx.strokeStyle = '#ffd700'; // Dourado
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, 580, 230);

        // 3. TEXTO (Usando fontes genéricas que o Linux aceita melhor)
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        
        // Nome do Herói
        ctx.font = 'bold 35px Arial'; 
        ctx.fillText(`⚔️ ${nome || 'VIAJANTE'}`, 40, 70);

        // Classe
        ctx.fillStyle = '#4db8ff';
        ctx.font = '25px Arial';
        ctx.fillText(`CLASSE: ${classe || 'APRENDIZ'}`, 40, 120);

        // Nível com barra de progresso fake
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`NÍVEL: ${level || '1'}`, 40, 170);
        
        // Barra de vida decorativa
        ctx.fillStyle = '#444';
        ctx.fillRect(40, 190, 520, 20);
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(40, 190, 400, 20); // 80% de vida

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (err) {
        res.status(500).send('Erro: ' + err.message);
    }
});

module.exports = app;
