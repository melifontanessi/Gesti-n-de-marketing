# 🚀 Guía de Despliegue en GitHub Pages (¡Gratis e Independiente!)

¡Buenas noticias! Como esta aplicación de **Gestión de Marketing / MktOps** funciona de manera puramente del lado del cliente (los datos de tareas, analistas y cronómetros se guardan de forma segura directamente en el almacenamiento local del navegador o `localStorage`), puedes hospedarla **100% gratis y para siempre** en **GitHub Pages**.

Esto significa que:
* **No pagarás nada de hosting** por usar esta herramienta con tu equipo.
* **Tendrás total independencia**: el código te pertenece. Si en algún momento yo no estoy disponible, tu sitio seguirá online y funcionando bajo tu propiedad.
* **Actualización en tiempo real**: gracias al automatismo que te acabo de programar en el archivo `.github/workflows/deploy.yml`, cada vez que subas cambios a tu GitHub, la página se actualizará sola.

---

## 📋 Pasos para publicarla en tu cuenta de GitHub (en 5 minutos)

### Paso 1: Descargar el código de la aplicación
1. En la esquina superior derecha de **Google AI Studio / Build**, haz clic en el icono de **configuración (la tuerca ⚙️)**.
2. Selecciona **Export to ZIP** (o vincula directamente a tu cuenta de GitHub con la opción **Export to GitHub** si prefieres iniciar sesión directamente).
3. Si descargaste el ZIP, descomprímelo en una carpeta de tu computadora.

---

### Paso 2: Crear un nuevo Repositorio de GitHub
1. Entra a tu cuenta en [github.com](https://github.com/) (si no tienes una, créala gratis).
2. Haz clic en el botón verde **New** (Nuevo) o ve a [github.com/new](https://github.com/new).
3. Llena los datos básicos:
   * **Repository name**: Dale un nombre (por ejemplo, `mktops` o `gestion-marketing`).
   * **Public / Private**: Elige **Public** (necesario para el plan gratuito de GitHub Pages, o puedes usar private si tienes cuenta de pago en GitHub, pero Public es gratis para todos).
   * **No agregues** archivos nuevos (no marques "Add a README file" ni adaptadores de gitignore ni licencias para que el repositorio quede completamente vacío al principio).
4. Haz clic en **Create repository**.

---

### Paso 3: Subir los archivos descargados a GitHub
Si utilizas la terminal o la aplicación de **GitHub Desktop** (la manera más fácil si no usas terminal):

#### Opción A: Subir los archivos manualmente arrastrando en la web (Para no usar terminal)
1. En la pantalla del repositorio vacío recién generado, verás un enlace azul que dice: **"uploading an existing file"** (subir un archivo existente). ¡Haz clic ahí!
2. Selecciona **todos los archivos y carpetas** de la aplicación (incluyendo `.github/`, `src/`, `package.json`, `.env.example`, `index.html`, etc.) y arrástralos hacia la ventana de GitHub en tu navegador web.
3. Espera a que se carguen todos los archivos.
4. En el cuadro de abajo, escribe un título (por ejemplo: `Primer deployment de MktOps`) y haz clic en el botón verde **Commit changes**.

#### Opción B: Subir mediante consola Git (Instrucciones estándar)
Abre la consola en la carpeta de tu aplicación y escribe estos comandos:
```bash
git init
git add .
git commit -m "feat: setup inicial con despliegue automatizado"
git branch -M main
git remote add origin https://github.com/TU_EMPRESA_O_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```
*(Reemplaza la URL de arriba con la que te da GitHub al crear el repo)*

---

### Paso 4: Activar GitHub Pages en tu repositorio
Gracias al archivo de integración que te acabo de configurar, GitHub Pages lo desplegará automáticamente. Solo debes decirle que lea nuestra acción automatizada:

1. Entra a tu repositorio en GitHub y ve a la pestaña superior derecha llamada **Settings (Configuración ⚙️)**.
2. En el menú lateral izquierdo, bajo el grupo **Code and automation**, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   * En **Source**, abre el selector que por defecto dice *Deploy from a branch* (Desplegar desde una rama) y cámbialo a **GitHub Actions**.
4. ¡Y listo! No tienes que hacer nada más.

---

### Paso 5: ¡Ver tu sitio web en vivo!
1. Haz clic en la pestaña **Actions** (Acciones) en la barra superior de tu repositorio.
2. Verás que hay un proceso corriendo llamado **Deploy to GitHub Pages**.
3. Una vez finalice y aparezca un círculo verde con un ✔️, haz clic en él.
4. Dentro verás un enlace directo como: `https://TU_USUARIO.github.io/TU_REPOSITORIO/`.
5. ¡Compártelo con tu equipo! Podrán abrir la aplicación, cronometrar tareas, cargar analistas y diseñar sin tener que iniciar sesión obligatoriamente con Google ni pagar un solo centavo de hospedaje.

---

## 💡 Consejos para el uso con el equipo
A disfrutar de tu nueva herramienta independiente y administrada por ti para siempre. ¡Mucho éxito en la gestión de marketing! 🚀
