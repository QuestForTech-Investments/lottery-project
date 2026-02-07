# Workflow de Deploy

## Despliegue Automático

Tanto el backend como el frontend tienen CI/CD configurado con GitHub Actions.

### Backend (.NET API)
```bash
cd /home/jorge/projects/lottery-project/api
git add .
git commit -m "mensaje"
git push
```
- **Trigger:** Push a `main`
- **Destino:** Azure App Service
- **URL producción:** API detrás de https://lottobook.net/api

### Frontend (React)
```bash
cd /home/jorge/projects/lottery-project/frontend-v4
git add .
git commit -m "mensaje"
git push
```
- **Trigger:** Push a `main`
- **Destino:** Azure Static Web Apps
- **URL producción:** https://lottobook.net

## Proceso de Pruebas

1. **Hacer cambios** en el código
2. **Commit y push** para desplegar
3. **Probar en producción** usando Playwright MCP o navegador
4. **Si hay errores**, fix y repetir

## Verificar Deploy

### Ver logs de GitHub Actions
```bash
gh run list --limit 5
gh run view <run-id>
```

### Probar endpoints
```bash
# Health check
curl https://lottobook.net/api/health

# Con autenticación
curl -H "Authorization: Bearer $TOKEN" https://lottobook.net/api/draws
```

## URLs Importantes

| Entorno | URL |
|---------|-----|
| Producción | https://lottobook.net |
| App Original | https://la-numbers.apk.lol |
| Local Frontend | http://localhost:4001 |
| Local API | http://localhost:5000 |

## Credenciales

| Sistema | Usuario | Contraseña |
|---------|---------|------------|
| Admin Producción | admin | Admin123456 |
| App Original | oliver | oliver0597@ |
