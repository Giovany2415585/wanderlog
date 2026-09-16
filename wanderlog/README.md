# 🌴 WanderLog — Travel Vlog & Planner

Tu diario de viajes personal. Itinerarios, checklists y spots fotográficos.

## Deploy en Railway

### 1. Crear proyecto en Railway
1. Ve a [railway.app](https://railway.app) y abre tu proyecto
2. Haz clic en **"+ New Service"** → **"GitHub Repo"**
3. Conecta este repositorio

### 2. Agregar PostgreSQL
1. En el proyecto haz clic en **"+ New Service"** → **"Database"** → **"PostgreSQL"**
2. Railway crea la base de datos automáticamente

### 3. Configurar variables de entorno
En tu servicio de Node.js, ve a **Variables** y agrega:
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
NODE_ENV = production
```

La variable `DATABASE_URL` se conecta automáticamente a tu PostgreSQL de Railway.

### 4. Deploy
Railway hace el deploy automáticamente al hacer push a main.

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear archivo .env con tu base de datos local
cp .env.example .env

# Iniciar servidor
npm start
```

## Estructura
```
wanderlog/
├── src/
│   ├── server.js    # Express + rutas
│   ├── db.js        # PostgreSQL + schema
│   └── seed.js      # Datos iniciales Curazao
├── views/
│   ├── index.ejs    # Página principal
│   └── trip.ejs     # Detalle de viaje
├── public/
│   ├── css/style.css
│   └── js/main.js
└── railway.json
```
