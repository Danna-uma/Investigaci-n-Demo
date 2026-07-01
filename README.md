# Investigacion-Demo
Investigación + Demo ISW521/ subir avances en el trabajo de investigación

# PWA Demo - Lista de Tareas Offline

## Descripción
Este proyecto es una Progressive Web App (PWA) que permite gestionar tareas con funcionamiento offline mediante Service Workers.

## Tecnologías
- HTML5
- CSS3
- JavaScript Vanilla
- Service Workers
- Web App Manifest
- LocalStorage

## Instalación
1. Clonar el repositorio:
git clone <repo-url>

2. Abrir el proyecto:
cd pwa-demo

3. Ejecutar servidor local (IMPORTANTE):
npx serve
o usar Live Server en VSCode.

4. Abrir en navegador:

http://localhost:3000

## Funcionalidades
- Agregar tareas
- Guardar en localStorage
- Funcionamiento offline
- Caché de archivos estáticos
- Instalación como app

## Estructura
- index.html → interfaz
- app.js → lógica
- service-worker.js → offline cache
- manifest.json → configuración instalable
- style.css → estilos

## Concepto clave
Una PWA permite que una web funcione como una app nativa usando caching, service workers y manifest.