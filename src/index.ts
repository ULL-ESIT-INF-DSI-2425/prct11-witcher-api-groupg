import express from 'express';
import './db/mongoose.js';
import hunterRoutes from './routes/hunter.routes.js';

const app = express();

app.use(express.json());
app.use('/hunters', hunterRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

export default app;



