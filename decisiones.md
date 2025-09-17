## Aplicación
Elegimos esta app porque forma parte de un proyecto extracurricular de uno de nosotros, al estar siguiendo un tutorial de javascript y react, quedaron determinadas esas tecnologías para el proyecto. Esta aplicación tiene una API, frontend, y ETL, lo que permite practicar todos los aspectos del containerizado.
Tecnología usada: Node.js + Express + Knex para el backend, MySQL para la base de datos, React + Vite para frontend.
Funcionalidad básica: CRUD de productos, consulta por categorías, un flujo ETL para cargar datos.

## Dockerfile del frontend
Usamos un build multi-etapa para mantener la imagen final liviana y segura.
- node:18-alpine para compilar el proyecto React + Vite porque es una imagen optimizada y con soporte LTS. Como compila y ya está, no necesitamos que sea el mismo que el del back.
- Para servir los archivos estáticos elegimos nginx:alpine por su bajo consumo de recursos y alta performance.
- npm ci para asegurar builds reproducibles y confiables.

Con esta estructura, cualquier cambio en el código vuelve a compilar el proyecto sin reinstalar dependencias innecesarias.
Docker construye imágenes en capas. Cada instrucción (COPY, RUN, etc.) crea una capa. Estas capas se guardan en caché para no volver a ejecutarlas si nada cambió en los archivos involucrados.
Por eso, copiamos primero solo package.json y package-lock.json y luego hacemos RUN npm ci. Así, si modifico cualquier archivo de mi código fuente, Docker NO reinstala todas las dependencias, porque la capa que instala npm ci todavía está en caché.
Luego copiamos el resto del código y hacemos npm run build, que sí se reconstruye cada vez que hay cambios. Cualquier cambio en el código recompila solo el proyecto y ya tiene las dependencias necesarias