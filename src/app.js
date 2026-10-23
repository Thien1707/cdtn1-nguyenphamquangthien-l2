require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const path = require('path');
const app = express();
const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/ticket.routes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', ticketRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;