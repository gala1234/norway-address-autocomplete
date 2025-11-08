import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

// Configuración inicial
const app = express();
const port = 8080; // El puerto que pide el ejercicio

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite al servidor entender JSON

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('¡El servidor backend está funcionando!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});