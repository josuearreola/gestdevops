const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('./index');

let server;
const PORT = 3002; // Puerto exclusivo para pruebas unitarias
const BASE = `http://localhost:${PORT}`;

before(() => {
  server = app.listen(PORT);
});

after(() => {
  server.close();
});

describe('=== PRUEBAS UNITARIAS DE CASOS EXITOSOS (HAPPY PATH) ===', () => {

  test('[200] GET /api/health - Debe responder con estado de salud ok', async () => {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'en vivo');
    assert.ok(data.timestamp);
    assert.ok(data.uptime);
  });

  test('[200] GET /api/status - Debe responder con estado online', async () => {
    const res = await fetch(`${BASE}/api/status`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'online');
    assert.ok(data.uptime);
  });

  test('[200] GET /api/users - Debe listar usuarios', async () => {
    const res = await fetch(`${BASE}/api/users`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data));
    assert.strictEqual(data.length, 2);
  });

  test('[200] GET /api/users/1 - Debe devolver el usuario solicitado', async () => {
    const res = await fetch(`${BASE}/api/users/1`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.id, '1');
    assert.strictEqual(data.name, 'Josue');
  });

  test('[200] GET /api/metrics - Debe devolver las métricas del sistema', async () => {
    const res = await fetch(`${BASE}/api/metrics`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(data.cpu);
    assert.ok(data.memory);
    assert.strictEqual(data.environment, 'production');
  });

  test('[201] POST /api/users - Debe crear un usuario con datos correctos', async () => {
    const res = await fetch(`${BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Maria', role: 'DevOps Lead' })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.message, 'Usuario creado');
    assert.strictEqual(data.user.name, 'Maria');
  });

  test('[200] POST /api/login - Debe iniciar sesión con credenciales correctas', async () => {
    const res = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'admin', password: '123' })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.message, 'Sesión iniciada');
    assert.ok(data.token);
  });

  test('[200] PUT /api/users/1 - Debe actualizar un usuario existente', async () => {
    const res = await fetch(`${BASE}/api/users/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Josue Actualizado' })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.name, 'Josue Actualizado');
  });

  test('[200] PUT /api/settings - Debe guardar configuración correctamente', async () => {
    const res = await fetch(`${BASE}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'dark', notifications: true })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.message, 'Configuración guardada');
    assert.strictEqual(data.settings.theme, 'dark');
  });

  test('[200] DELETE /api/users/1 - Debe eliminar un usuario existente', async () => {
    const res = await fetch(`${BASE}/api/users/1`, { method: 'DELETE' });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.message, 'Usuario 1 eliminado correctamente');
  });

  test('[200] DELETE /api/cache - Debe vaciar la caché', async () => {
    const res = await fetch(`${BASE}/api/cache`, { method: 'DELETE' });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.message, 'Caché eliminada con éxito');
  });

});

describe('=== PRUEBAS UNITARIAS DE CASOS DE ERROR (UNHAPPY PATHS) ===', () => {

  test('[400 Bad Request] POST /api/users - Error cuando el usuario NO envía el nombre', async () => {
    const res = await fetch(`${BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'Solo Rol Sin Nombre' })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.error, 'El campo "name" es obligatorio');
  });

  test('[400 Bad Request] PUT /api/users/1 - Error cuando se manda cuerpo vacío al actualizar', async () => {
    const res = await fetch(`${BASE}/api/users/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.error, 'Debes enviar al menos el campo "name" para actualizar');
  });

  test('[400 Bad Request] PUT /api/settings - Error si se envían ajustes vacíos', async () => {
    const res = await fetch(`${BASE}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.error, 'El cuerpo de configuración no puede estar vacío');
  });

  test('[401 Unauthorized] POST /api/login - Error por contraseña incorrecta', async () => {
    const res = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'admin', password: 'PASSWORD_FALSA' })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.error, 'Credenciales inválidas (usuario o contraseña incorrectos)');
  });

  test('[401 Unauthorized] POST /api/login - Error por usuario no registrado', async () => {
    const res = await fetch(`${BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'usuario_fantasma', password: '123' })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.error, 'Credenciales inválidas (usuario o contraseña incorrectos)');
  });

  test('[404 Not Found] GET /api/users/999 - Error al consultar usuario que no existe', async () => {
    const res = await fetch(`${BASE}/api/users/999`);
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.error, 'Usuario no encontrado');
  });

  test('[404 Not Found] DELETE /api/users/999 - Error al intentar eliminar un usuario inexistente', async () => {
    const res = await fetch(`${BASE}/api/users/999`, { method: 'DELETE' });
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.error, 'No se puede eliminar: usuario no encontrado');
  });

  test('[404 Not Found] GET /api/ruta-inexistente - Error al llamar a un endpoint que no existe', async () => {
    const res = await fetch(`${BASE}/api/ruta-inexistente`);
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.error, 'Ruta no encontrada');
  });

});
