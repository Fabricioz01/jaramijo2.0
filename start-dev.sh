#!/bin/bash

# Script para iniciar el entorno de desarrollo completo

echo "🚀 Iniciando entorno de desarrollo del Municipio de Jaramijó..."

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if netstat -an | grep -q ":$port "; then
        echo "⚠️  Puerto $port ya está en uso"
        return 1
    else
        echo "✅ Puerto $port disponible"
        return 0
    fi
}

# Verificar puertos
echo "🔍 Verificando puertos..."
check_port 3000 || exit 1
check_port 4200 || exit 1

# Iniciar backend
echo "🟢 Iniciando backend en puerto 3000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend
echo "🔵 Iniciando frontend en puerto 4200..."
cd ../frontend
npm run build
npm run dev-server &
FRONTEND_PID=$!

echo "✅ Servidores iniciados:"
echo "   📱 Frontend: http://localhost:4200"
echo "   ⚙️  Backend:  http://localhost:3000"
echo "   🏥 Health:   http://localhost:4200/api/v1/health"

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar señales para limpieza
trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait
