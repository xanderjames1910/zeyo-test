# Proceso API

## Pasos para levantar el proyecto

1. **Base de datos**
   ```bash
   cd proceso-api
   docker-compose up -d
   docker exec -i proceso-api-db-1 psql -U user -d processes_db < db.sql
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## URLs
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api