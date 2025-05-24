 const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT ||3332 ;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to validate HLS URLs if needed
app.get('/api/validate', (req, res) => {
    const videoUrl = req.query.url;
    // Here you could add validation logic for the HLS URL
    res.json({ valid: true, url: videoUrl });
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});