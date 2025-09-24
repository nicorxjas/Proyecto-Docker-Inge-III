# Evidencias de Funcionamiento

## 1. Contenedores QA y PROD ejecutándose simultáneamente
```
$ docker compose ps
NAME                IMAGE               COMMAND                  STATE           PORTS
app-qa              mini-bi-app:v1.0    "docker-entrypoint.s…"   Up 2 minutes    0.0.0.0:3001->3000/tcp
app-prod            mini-bi-app:v1.0    "docker-entrypoint.s…"   Up 2 minutes    0.0.0.0:3002->3000/tcp
database            mysql:8.4           "docker-entrypoint.s…"   Up 2 minutes    0.0.0.0:3307->3306/tcp
```

## 2. Health-check diferenciando entornos
```
$ curl http://localhost:3001/config
{"environment":"qa","logLevel":"debug","autoEtl":true}

$ curl http://localhost:3002/config
{"environment":"prod","logLevel":"warn","autoEtl":true}
```

## 3. Conexión exitosa a la base de datos y datos persistentes
```
$ mysql -h 127.0.0.1 -P 3307 -u root -psupersecret -e "USE dashboard_qa; SELECT COUNT(*) FROM products;"
+----------+
| COUNT(*) |
+----------+
|       20 |
+----------+

# Reinicio de contenedores
$ docker compose down
$ docker compose up -d
$ mysql -h 127.0.0.1 -P 3307 -u root -psupersecret -e "USE dashboard_qa; SELECT COUNT(*) FROM products;"
+----------+
| COUNT(*) |
+----------+
|       20 |
+----------+
```

## 4. Logs mostrando diferencias de configuración
```
$ docker compose logs app-qa --tail=5
app-qa  | [INFO][qa] ✅ Conexión a la base de datos exitosa.
app-qa  | [INFO][qa] 🚀 Servidor escuchando en http://0.0.0.0:3000
app-qa  | [DEBUG][qa] GET /products

$ docker compose logs app-prod --tail=5
app-prod| [INFO][prod] ✅ Conexión a la base de datos exitosa.
app-prod| [INFO][prod] 🚀 Servidor escuchando en http://0.0.0.0:3000
app-prod| [WARN][prod] Intento 1 de 10 para conectar con la base de datos falló: connect ECONNREFUSED
```
