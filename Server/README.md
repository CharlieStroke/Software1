# 🍽️ SISTEMA DE GESTIÓN DE RESTAURANTE - BACKEND

Sistema backend para gestión de restaurantes con autenticación JWT y API REST.

## 📋 REQUISITOS PREVIOS

- Node.js (v18 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## 🚀 INSTALACIÓN

### 1. Instalar dependencias

```bash
cd Server
npm install
```

### 2. Configurar base de datos

Ejecuta el archivo `Database/database.sql` en MySQL:

```bash
mysql -u root -p < ../Database/database.sql
```

O desde MySQL Workbench/phpMyAdmin, importa el archivo.

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `Server/`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
PORT=3000
NODE_ENV=development

MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=tu_password
MYSQLDATABASE=restaurante_db

TOKEN_SECRET=mi_secreto_super_seguro_cambiar_en_produccion
URLPERMITED=http://localhost:5173
SESSION_TIMEOUT=3600
```

### 4. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo con nodemon:

```bash
npm run dev
```

El servidor se iniciará en: `http://localhost:3000`

## 📡 ENDPOINTS DISPONIBLES

### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth Requerida |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| GET | `/api/auth/verify` | Verificar token | ✅ |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ |
| POST | `/api/auth/refresh` | Renovar token | ✅ |

### 🏥 Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |

## 🧪 PRUEBAS CON POSTMAN

### PASO 1: Registrar un usuario

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "5551234567",
  "email": "admin@restaurante.com",
  "password": "123456",
  "rol": "admin"
}
```

**Respuesta exitosa (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "admin@restaurante.com",
    "rol": "admin"
  }
}
```

---

### PASO 2: Iniciar sesión

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@restaurante.com",
  "password": "123456"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "admin@restaurante.com",
    "rol": "admin",
    "sucursal_id": null
  }
}
```

**⚠️ IMPORTANTE:** Copia el `token` que recibes, lo necesitarás para las siguientes peticiones.

---

### PASO 3: Verificar token

**Endpoint:** `GET http://localhost:3000/api/auth/verify`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "admin@restaurante.com",
    "rol": "admin",
    "telefono": "5551234567",
    "sucursal_id": null
  }
}
```

---

### PASO 4: Cerrar sesión

**Endpoint:** `POST http://localhost:3000/api/auth/logout`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta exitosa (200):**
```json
{
  "message": "Logout exitoso"
}
```

---

### PASO 5: Renovar token

**Endpoint:** `POST http://localhost:3000/api/auth/refresh`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🎯 CONFIGURACIÓN DE POSTMAN

### Opción 1: Usar variables de entorno

1. Crea una colección llamada "Restaurante API"
2. En la colección, ve a "Variables"
3. Agrega estas variables:

| Variable | Valor | Type |
|----------|-------|------|
| `base_url` | `http://localhost:3000/api` | default |
| `token` | (vacío al inicio) | default |

4. En tus requests, usa: `{{base_url}}/auth/login`

### Opción 2: Guardar token automáticamente

En la pestaña "Tests" de la petición de login, agrega:

```javascript
// Guardar token automáticamente
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.collectionVariables.set("token", jsonData.token);
  console.log("Token guardado:", jsonData.token);
}
```

Luego en los headers de otras peticiones usa:
```
Authorization: Bearer {{token}}
```

---

## ❌ POSIBLES ERRORES

### Error 400: "Credenciales inválidas"
- Email o contraseña incorrectos
- Verifica que el usuario exista en la BD

### Error 401: "No token, acceso denegado"
- No se envió el token
- Verifica el header `Authorization: Bearer TOKEN`

### Error 401: "Token no válido"
- El token expiró (dura 1 hora)
- El token fue modificado
- Solicita un nuevo token con login

### Error 403: "Usuario inactivo"
- El usuario fue desactivado
- Contacta al administrador

### Error 500: "Error en el servidor"
- Revisa que MySQL esté corriendo
- Verifica las credenciales en el `.env`
- Revisa los logs del servidor

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Server/
├── controllers/        # Lógica de negocio
│   └── Auth.Controller.js
├── middlewares/        # Middlewares de validación
│   ├── validateToken.js
│   └── Validator.Middleware.js
├── routes/            # Definición de rutas
│   └── auth.routes.js
├── schemas/           # Validaciones con Zod
│   └── auth.schema.js
├── utils/             # Utilidades
│   └── jwt.js
├── app.js            # Configuración de Express
├── config.js         # Variables de entorno
├── db.js             # Conexión a MySQL
├── index.js          # Punto de entrada
└── .env              # Variables de entorno (no incluido en git)
```

---

## 🔒 ROLES DISPONIBLES

- `admin` - Administrador del sistema
- `mesero` - Mesero del restaurante
- `cocinero` - Personal de cocina
- `dueño` - Propietario/Gerente

---

## 🛠️ COMANDOS ÚTILES

```bash
# Iniciar servidor
npm start

# Modo desarrollo con auto-reload
npm run dev

# Ver logs en tiempo real
npm start | grep AUTH

# Probar conexión a la BD
node -e "import('./db.js').then(m => m.testConnection())"
```

---

## 📝 NOTAS IMPORTANTES

1. **Token Expiration:** Los tokens expiran en 1 hora por defecto
2. **CORS:** Solo se permite el origen configurado en `URLPERMITED`
3. **Cookies:** Se usan cookies HTTP-only para mayor seguridad
4. **Passwords:** Se encriptan con bcrypt (salt rounds: 10)
5. **Validación:** Se valida tanto en frontend (Yup) como backend (Zod)

---

## 🐛 DEBUG

Para ver logs detallados de autenticación:

```bash
NODE_ENV=development npm start
```

Los logs mostrarán:
- `[TIMESTAMP] AUTH: Login exitoso { email, userId, rol }`
- `[TIMESTAMP] AUTH: Login fallido - ...`
- `[TIMESTAMP] AUTH: Logout exitoso { userId }`

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que MySQL esté corriendo
2. Revisa el archivo `.env`
3. Comprueba los logs del servidor
4. Prueba el endpoint `/api/health`

---

## 🎉 ¡LISTO!

Tu backend está funcionando. Ahora puedes:
1. ✅ Registrar usuarios
2. ✅ Iniciar sesión
3. ✅ Proteger rutas con JWT
4. ✅ Continuar con los siguientes módulos (sucursales, usuarios, etc.)
