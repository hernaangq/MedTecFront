const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

app.get('/data', (req, res) => {
  res.json({
    location: { lat: 40.4168, lng: -3.7038 }, // Ejemplo: Madrid
    eta: '2025-05-06T12:00:00',
    temperature: {
      times: ['08:00', '09:00', '10:00', '11:00', '12:00'],
      values: [4, 4.2, 4.1, 3.9, 4.0]
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

