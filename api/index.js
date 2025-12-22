const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const app = express();

app.get('/api/teste', async (req, res) => {
    const { nome, classe, level } = req.query;

    // Criar um canvas de 600x200
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    // Fundo Gradiente Estiloso
    const gradiente = ctx.createLinearGradient(0, 0, 600, 0);
    gradiente.addColorStop(0, '#1a1a2e');
    gradiente.addColorStop(1, '#16213e');
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, 600, 200);

    // Borda
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, 600, 200);

    // Textos
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`HERÓI: ${nome || 'Viajante'}`, 30, 70);
    
    ctx.fillStyle = '#e94560';
    ctx.font = '25px sans-serif';
    ctx.fillText(`CLASSE: ${classe || 'Aprendiz'}`, 30, 110);
    
    ctx.fillStyle = '#4ecca3';
    ctx.fillText(`NÍVEL: ${level || '1'}`, 30, 150);

    // Retornar a imagem como PNG
    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer());
});

// Exportar para o Vercel
module.exports = app;
