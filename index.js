const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. GET - Salud del sistema
app.get('/api/health', (req, res) => { 
  res.status(200).json({ status: 'en vivo 334', timestamp: new Date().toISOString(), uptime: `${Math.floor(process.uptime())}s` });
});

// 2. GET - Estado del sistema
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'online', uptime: `${Math.floor(process.uptime())}s` });
});

// 2. GET - Lista general de usuarios
app.get('/api/users', (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Admin', role: 'DevOps' },
    { id: 2, name: 'Josue', role: 'Developer' }
  ]);
});

// 3. GET - Obtener usuario por ID (Maneja 200 y 404)
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  if (id === '999') {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.status(200).json({ id, name: 'Josue', role: 'Developer' });
});

// 4. GET - Métricas del sistema
app.get('/api/metrics', (req, res) => {
  res.status(200).json({ cpu: '24%', memory: '512MB', environment: 'production' });
});

// 5. POST - Crear usuario (Maneja 201 y 400 Bad Request si falta el nombre)
app.post('/api/users', (req, res) => {
  const { name, role } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'El campo "name" es obligatorio' });
  }
  res.status(201).json({ message: 'Usuario creado', user: { id: 3, name, role: role || 'User' } });
});

// 6. POST - Login (Maneja 200 y 401 Unauthorized si las credenciales son incorrectas)
app.post('/api/login', (req, res) => {
  const { user, password } = req.body || {};
  if (user !== 'admin' || password !== '123') {
    return res.status(401).json({ error: 'Credenciales inválidas (usuario o contraseña incorrectos)' });
  }
  res.status(200).json({ message: 'Sesión iniciada', token: 'jwt-token-valido-12345' });
});

// 7. PUT - Actualizar usuario (Maneja 200 y 400 si no envía datos)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'Debes enviar al menos el campo "name" para actualizar' });
  }
  res.status(200).json({ message: `Usuario ${id} actualizado`, data: { id, name } });
});

// 8. PUT - Modificar ajustes
app.put('/api/settings', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'El cuerpo de configuración no puede estar vacío' });
  }
  res.status(200).json({ message: 'Configuración guardada', settings: req.body });
});

// 9. DELETE - Eliminar usuario (Maneja 200 y 404 si no existe)
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  if (id === '999') {
    return res.status(404).json({ error: 'No se puede eliminar: usuario no encontrado' });
  }
  res.status(200).json({ message: `Usuario ${id} eliminado correctamente` });
});

// 10. DELETE - Limpiar caché
app.delete('/api/cache', (req, res) => {
  res.status(200).json({ message: 'Caché eliminada con éxito' });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor activo en http://localhost:${PORT}`));
}

module.exports = app;
