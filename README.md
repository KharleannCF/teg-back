## Requisitos Previos

Antes de poder ejecutar este proyecto, asegúrate de tener instalados los siguientes programas:

- **Node.js**: Versión 14.x o superior
- **npm**: Versión 6.x o superior
- **MongoDB**: Una instancia de MongoDB local o remota

## Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone [https://github.com/KharleannCF/teg-back.git](https://github.com/KharleannCF/teg-back.git)
   cd teg-back
   ```

2. **Instalar las dependencias**

```bash
npm install
```
3. **Configurar las variables de entorno**:

Crea un archivo .env en la raíz del proyecto y define las siguientes variables según tu configuración:

```plaintext
PORT=3000
MONGODB_URI=<preguntar al equipo>
JWT_SECRET=<preguntar al equipo>
```

## Uso
1. **Iniciar el servidor**:

Después de configurar todo, puedes iniciar el servidor utilizando:

```bash
npm start
```
El servidor se ejecutará en el puerto definido en el archivo .env (por defecto, 3000).

2. **En desarrollo**:

Para iniciar el servidor en modo desarrollo (con compilación automática), ejecuta:

```bash
npm run dev
```

## Dependencias Principales
* Express: Framework para crear aplicaciones web y API REST.
* Mongoose: Librería de modelado de objetos para MongoDB.
* Bcrypt: Herramienta para cifrar contraseñas.
* JWT: JSON Web Tokens para autenticación y autorización.
* Nodemon: Herramienta para reiniciar automáticamente el servidor cuando se detectan cambios en los archivos.
* Axios: Cliente HTTP para realizar solicitudes a servicios externos.
* Morgan: Middleware para registrar las solicitudes HTTP.
* dotenv: Carga variables de entorno desde un archivo .env.
* Google APIs: Librería para trabajar con APIs de Google.
