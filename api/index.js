
const express = require('express');
const { createCanvas } = require('canvas');
const app = express();

app.get('/api/teste', (req, res) => {
    try {
        const { nome, classe, level } = req.query;
        const canvas = createCanvas(600, 200);
        const ctx = canvas.getContext('2d');

        // Fundo
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 600, 200);

        // Texto
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.fillText(`HERÓI: ${nome || 'Viajante'}`, 50, 80);
        ctx.fillText(`LVL: ${level || '1'}`, 50, 130);

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (err) {
        res.status(500).send('Erro interno: ' + err.message);
    }
});

// IMPORTANTE: Exportar o app
module.exports = app;
