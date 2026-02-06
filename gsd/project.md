# Proyecto: Lottery System

## Nombre
Lottobook - Sistema de Gestión de Loterías

## Descripción
Sistema completo de gestión de loterías dominicanas y estadounidenses. Replica y mejora la funcionalidad de la aplicación original (la-numbers.apk.lol) con un frontend moderno en React y una API robusta en .NET.

## Objetivo Principal
Crear un sistema completo que permita:
- Gestionar bancas (puntos de venta)
- Procesar tickets de lotería (ventas)
- Calcular premios y comisiones
- Generar reportes de ventas y balances
- Administrar usuarios y permisos

## Alcance (IN)
- Frontend React + TypeScript + Material-UI (puerto 4001)
- API .NET 8.0 + Entity Framework Core (puerto 5000)
- Base de datos Azure SQL Server
- Despliegue en Azure Static Web Apps
- 23 módulos funcionales identificados
- Soporte para 70+ loterías (dominicanas y USA)
- 26 tipos de jugadas

## Fuera de Alcance (OUT)
- Aplicación móvil nativa
- Sistema de pagos/transacciones financieras reales
- Integración directa con API de lotocompany (bloqueada)

## Usuarios Objetivo
- Administradores de bancas
- Operadores de puntos de venta (POS)
- Cobradores
- Supervisores de zona

## Restricciones
- Resultados de lotería se obtienen via web scraping (no hay API directa)
- Código en inglés, UI en español
- Compatibilidad con navegadores modernos

## Stack Tecnológico
| Componente | Tecnología |
|------------|------------|
| Frontend | React 18 + Vite + TypeScript + Material-UI |
| Backend | .NET 8.0 + Entity Framework Core 8.0 |
| Database | Azure SQL Server |
| Hosting | Azure Static Web Apps |
| Testing | Playwright |

## Principios del Proyecto
1. **Código en inglés** - Variables, funciones, componentes en inglés
2. **UI en español** - Textos visibles al usuario en español
3. **No sobre-ingeniar** - Solo lo necesario para la tarea actual
4. **Documentar decisiones** - En archivos markdown, no en la conversación
5. **Verificar visualmente** - Usar Playwright para confirmar coherencia UI
