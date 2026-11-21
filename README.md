# 🛍️ ARAE - Creador de Tiendas Online

ARAE es una plataforma SaaS (Software as a Service) que permite a emprendedores crear y administrar su propia tienda online en minutos, sin necesidad de conocimientos de programación.

El objetivo es ofrecer una herramienta sencilla para que pequeños comercios puedan publicar sus productos, recibir pedidos y gestionar su negocio desde un solo lugar.

## ✨ Características principales

### 🏪 Creación y personalización de tiendas
- Registro de usuarios y creación de tiendas online.
- Configuración del nombre, categoría y datos de contacto.
- Más de 20 templates adaptados a distintos rubros.
- Vista previa de diseños antes de aplicarlos.
- Personalización de la tienda mediante la subida de un logo.

### 📦 Gestión de productos
- Panel de administración para agregar, editar y eliminar productos.
- Carga de imágenes con redimensionado automático.
- Administración de precios y stock.
- Categorías dinámicas para organizar los productos.
- Visualización de productos en la tienda pública.

### 🛒 Experiencia de compra
- Catálogo público de productos.
- Filtros por categorías.
- Carrito de compras lateral.
- Persistencia del carrito en el navegador.
- Envío de pedidos mediante WhatsApp.
- Registro automático de pedidos en la plataforma.
- Cálculo de subtotales y total del pedido en el servidor.
- Validación de productos y disponibilidad de stock antes de registrar un pedido.

### 📋 Gestión de pedidos y ventas
- Visualización de pedidos desde el Dashboard.
- Estados de pedido: pendiente, vendido y cancelado.
- Confirmación de pedidos desde el sistema.
- Descuento automático del stock al confirmar una venta.
- Devolución del stock cuando se cancela una venta confirmada.
- Registro de fechas de venta y cancelación.
- Validación de cambios de estado para evitar operaciones duplicadas.
- Historial de pedidos ordenado por fecha.

### 🔐 Seguridad y autenticación
- Autenticación de usuarios mediante Supabase Auth.
- Protección de operaciones privadas mediante tokens de autenticación.
- Verificación de propiedad de las tiendas antes de modificar sus datos.
- Protección de operaciones de creación, edición y eliminación de productos.
- Protección de las operaciones de gestión de pedidos.
- Google reCAPTCHA v3 para reducir registros automatizados.
- Almacenamiento de imágenes mediante Supabase Storage.

### 🎁 Prueba gratuita
- Período de prueba de 7 días para nuevos usuarios.

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| Next.js 16.4.6 | Frontend y backend (App Router) |
| React | Interfaces de usuario |
| TypeScript | Tipado y desarrollo |
| Tailwind CSS v4 | Estilos y diseño |
| Prisma ORM | Acceso y gestión de datos |
| PostgreSQL | Base de datos |
| Supabase Auth | Autenticación |
| Supabase Storage | Almacenamiento de imágenes |
| Google reCAPTCHA v3 | Protección anti-bots |

## 🚀 Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto y completar las credenciales correspondientes:

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

**Importante:** No subir el archivo `.env` al repositorio. Las claves y credenciales deben mantenerse privadas.

### 4. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abrir http://localhost:3000 en el navegador.

### 6. Compilar para producción

Para comprobar que el proyecto puede compilarse:

```bash
npm run build
```

Para ejecutar la versión de producción localmente:

```bash
npm start
```

## 📁 Estructura general del proyecto

```text
ARAE/
├── app/
│   ├── api/
│   │   ├── orders/       # Registro y gestión de pedidos
│   │   ├── products/     # Gestión de productos
│   │   └── stores/       # Gestión de tiendas
│   ├── dashboard/        # Panel de administración
│   ├── registro/         # Registro de usuarios y tiendas
│   ├── t/[slug]/         # Tienda pública
│   └── ...               # Otras páginas
├── components/           # Componentes reutilizables
├── lib/                  # Configuración de Prisma y Supabase
├── prisma/
│   └── schema.prisma     # Modelos y estructura de datos
├── public/               # Recursos estáticos
├── .env                  # Variables privadas (no subir)
└── README.md
```

## 🔒 Consideraciones de seguridad

- Las operaciones privadas requieren autenticación.
- El servidor verifica que el usuario sea propietario de la tienda antes de modificar sus recursos.
- Las operaciones de pedidos y stock se validan desde el servidor.
- Las credenciales privadas deben configurarse mediante variables de entorno.
- Las políticas de Supabase Storage deben restringir las operaciones de escritura a los usuarios autorizados.
- El archivo `.env` y las credenciales privadas no deben publicarse en el repositorio.

## 📌 Estado del proyecto

ARAE cuenta con las funcionalidades principales para la creación y administración de tiendas online, gestión de productos, recepción de pedidos y control de ventas.

El siguiente objetivo es completar las pruebas de seguridad, rendimiento y funcionamiento en producción para preparar el lanzamiento inicial de la plataforma.

---

**ARAE** - Una forma sencilla de llevar tu negocio al mundo digital. 🚀