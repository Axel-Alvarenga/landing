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
- Registro de pedidos en la plataforma.

### 📋 Gestión de pedidos y ventas
- Estados de pedido: pendiente, vendido y cancelado.
- Confirmación de ventas desde el sistema.
- Actualización del stock al confirmar una venta.
- Registro de fechas de venta y cancelación.

### 🔐 Seguridad y autenticación
- Autenticación de usuarios mediante Supabase.
- Protección de operaciones mediante sesiones y tokens.
- Verificación de propiedad de las tiendas antes de modificar sus datos.
- Protección de rutas para productos y configuración de tiendas.
- Google reCAPTCHA v3 para reducir registros automatizados.
- Almacenamiento de imágenes mediante Supabase Storage.

### 🎁 Prueba gratuita
- Período de prueba de 7 días para nuevos usuarios.

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| Next.js 15 | Frontend y backend (App Router) |
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

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📁 Estructura general del proyecto

```text
ARAE/
├── app/
│   ├── api/             # Rutas de la API
│   ├── dashboard/       # Panel de administración
│   ├── registro/        # Registro de usuarios y tiendas
│   └── ...              # Páginas públicas
├── components/          # Componentes reutilizables
├── lib/                 # Configuración de Prisma y Supabase
├── prisma/
│   └── schema.prisma    # Modelos y estructura de datos
├── public/              # Recursos estáticos
├── .env                 # Variables privadas (no subir)
└── README.md
```

## 🔒 Consideraciones de seguridad

- Las operaciones privadas requieren autenticación.
- El servidor verifica que el usuario sea propietario de la tienda antes de modificar sus recursos.
- Las credenciales privadas deben configurarse mediante variables de entorno.
- Las políticas de Supabase Storage deben restringir las operaciones de escritura a los usuarios autorizados.

## 📌 Estado del proyecto

ARAE se encuentra en desarrollo. Se están implementando progresivamente nuevas funcionalidades para mejorar la administración de tiendas, productos, pedidos y ventas.

---

**ARAE** - Una forma sencilla de llevar tu negocio al mundo digital. 🚀