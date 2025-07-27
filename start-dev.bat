@echo off
echo 🚀 Iniciando entorno de desarrollo del Municipio de Jaramijo...

REM Verificar si los puertos están disponibles
echo 🔍 Verificando puertos...

REM Iniciar backend
echo 🟢 Iniciando backend en puerto 3000...
cd backend
start /B npm run dev

REM Esperar un poco para que el backend inicie
timeout /t 3 /nobreak > nul

REM Construir y iniciar frontend
echo 🔵 Construyendo y iniciando frontend en puerto 4200...
cd ../frontend
call npm run build
start /B npm run dev-server

echo ✅ Servidores iniciados:
echo    📱 Frontend: http://localhost:4200
echo    ⚙️  Backend:  http://localhost:3000
echo    🏥 Health:   http://localhost:4200/api/v1/health
echo.
echo Presiona Ctrl+C para detener ambos servidores
pause
