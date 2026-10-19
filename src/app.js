const express = require('express');
const app = express();
const ticketRoutes = require('./routes/ticket.routes');

app.use(express.json());
app.use('/api/v1', ticketRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});