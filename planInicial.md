Se debe crear una aplicacion de notas, tipo Joplin, Obsidian, Notion, Google Keep, Post It, etc. Cada nota la creara el usuario y se almacenara en el storage del navegador.

- Crea un README.md y un AGENT.md con la informacion relevante.
- Usaras Opensec GitHub Spec Kit (https://github.com/github/spec-kit)
- El desarrollo inicial solo sera frontend usando react 19 + bun
- El desarrollo sera una pagina por componentes estilo "Post It", pero tambien permitirar cambiar a un interfaz tipo lista.
- Debemos tener un sidebar con las notas, con la posibilidad de ordenamiento
- Tendremos un body donde mostraremos las notas como "Post It"
- tanto en el sidebar como en el body se deben poder mover notas de posicion
- Las notas deben soportar markdown en su totalidad. Se tendra la opcion de cambiar de vista entre editar y ver en markdown.
- La notas se almacenaran en el storage del navegador.
- Se debera soportar adjuntar archivos como imagenes.
- Las notas podran ser cambiadas de colores, para diferenciar.
- Se pueden buscar notas con un control de busqueda en la pate superior
- Las notas deben almacenar fecha de creacion y fecha de modificacion en utc 0
- Las notas se podran borrar y pasan al papelero, que dentro de 7 dias se deben eliminar, las notas deben tener fecha de eliminacion. Las notas deben poder restaurarse en caso de ser necesario.
- Las notas deberan poder almacenar historial para poder volver atras en el tiempo
- Se podran seleccionar emojis para identificar las notas
- Las notas deben tener titulos.
- Las notas pueden tener tag
- Se deberan usar solo librerias de licencia libre como Apache, BSD, MIT o similares de forma libre
- Las notas deben tener drag and drop para moverlas.
- Usaremos "npx skills add https://github.com/vercel-labs/skills --skill find-skills" para buscar las skills necesarias
- Debemos usar skills de diseño UI/UX
- Tendremos diversos agentes para el desarrollo como Arquitecto, Product Owner, Developer, UI/UX, Tester QA, Seguridad. Todos ellos deben discutir para llegar a concenso antes de tomar decisiones.
- Las notas se deberan poder agrupar por tag, carpetas o proyectos.
- Las notas se deben guardar en formato markdown, ya que en un futuro se podran sincronizar con almacenes como google drive o similares
- genera el .gitignore necesario.
- el codigo del proyecto debe quedar en la carpeta src/frontend y en src/docker

Otras recomendaciones:

- Definir estrategia de storage para adjuntos: usar IndexedDB con idb en lugar de localStorage para imágenes y archivos binarios, con límite de tamaño por adjunto.
- Definir política de historial de versiones: máximo de versiones por nota, comportamiento al restaurar del papelero e indicador de uso de storage.
- Diseñar esquema de metadatos en frontmatter YAML desde el inicio pensando en la futura sincronización con Google Drive u otros destinos.
- Especificar cómo se integra OpenSec GitHub Spec Kit con React 19 + Bun (linting, análisis estático, CI pipeline).
- Soportar exportar e importar notas en formato ZIP de archivos .md.
- Agregar atajos de teclado: nueva nota, buscar, toggle edición/preview, deshacer, borrar nota seleccionada.
- Soportar modo oscuro, claro y seguir preferencia del sistema.
- Configurar la app como PWA con manifest.json y service worker básico para uso offline.
- Mostrar indicador de uso de storage y definir comportamiento al alcanzar el límite.
- Agregar filtros avanzados de búsqueda por tag, color, rango de fechas y presencia de adjuntos.
- Cumplir estándares básicos de accesibilidad: ARIA labels, navegación por teclado y contraste WCAG AA.