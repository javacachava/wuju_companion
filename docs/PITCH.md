# PITCH

> Tres versiones del pitch. Cada dev usa la que necesite: Dev A para copy de landing, Dev B para el video, todos para explicar el producto a jueces y visitantes.

## Versión 30 segundos (el ascensor)

Los asistentes de IA de hoy son cajas negras sin cara ni permisos claros. Nosotros hicimos **El Compañero**: un asistente libre y de código abierto al que le elegís quién es —cara, voz, personalidad— y le decís exactamente qué puede tocar. Hoy lo mostramos como compañero de programadores, con auditoría de código en vivo. Mañana es el mismo compañero para cualquier profesión. Mismo cascarón, distintos packs de habilidades.

## Versión 2 minutos (el demo)

**Problema.**
Los profesionales que trabajan frente a una pantalla usan hoy media docena de asistentes de IA: uno para código, otro para marketing, otro para diseño. Ninguno los conoce, ninguno recuerda lo que hicieron ayer, ninguno tiene identidad. Y todos son cajas negras: les damos acceso a nuestros archivos y no podemos leer qué hacen adentro.

**Solución.**
El Compañero. Un cascarón libre, bajo licencia AGPL, al que el usuario le elige tres cosas al abrirlo: quién es (personaje del catálogo, con voz), qué sabe (packs de capacidades por profesión) y qué puede tocar (permisos granulares sobre archivos y servicios).

**Demo.**
[Escena 1] Elegís la mascota, la voz, el nombre. Hola compañero.
[Escena 2] Chateo normal, el compañero responde con su voz. Memoria persistente entre conversaciones.
[Escena 3] Activo el skill Guardián de código. Pego código con vulnerabilidades. El compañero devuelve un audit con severidades, ubicación y fix propuesto. Y me lo cuenta con su voz.
[Escena 4] Voy al marketplace, agrego un personaje nuevo. Vuelvo al compañero — ya está en el wardrobe.

**Negocio.**
Software libre en el core. Ingresos en tres vías: marketplace curado con comisión sobre packs y personajes premium, agentes empresariales pre-configurados (setup alto + mantenimiento mensual) para que cada practicante tenga un senior virtual, y donaciones.

**Cierre.**
Cursor te ayuda a programar. ChatGPT te responde. Character.ai te acompaña. Nosotros somos lo único que hace las tres cosas — con permisos claros y código abierto.

## Versión 5 minutos (pitch completo al jurado)

### Apertura (30s)
Todos usamos asistentes de IA todos los días. Y todos tenemos el mismo problema: son cajas negras, no nos conocen, no tienen personalidad, y usamos uno distinto para cada tarea. Nosotros construimos algo distinto.

### Producto (90s)
El Compañero es un asistente libre, de código abierto bajo AGPL, con tres decisiones que el usuario toma al abrirlo por primera vez.

**Quién es.** Elegís del catálogo un personaje: mascota, personalidad, voz. Ese compañero te va a acompañar en todo lo que hagas.

**Qué sabe.** Activás los packs de capacidades que necesitás. Un pack de desarrollo con auditoría de código. Un pack de marketing con análisis de campañas. Un pack de diseño. Un pack de negocios. Cada pack se especializa, todos comparten al compañero.

**Qué puede tocar.** Le concedés permisos granulares — leer esta carpeta, acceder a este repo, ejecutar esta acción vía n8n. Todo es explícito, todo es revocable, todo es auditable porque el código es libre.

### Demo (90s)
[Aquí va la versión de 2 minutos condensada — mostrar los 4 escenarios en flujo]

### Modelo de negocio (60s)
Nuestro core es libre. No cobramos por el compañero. Cobramos por:

**Marketplace curado.** Personajes premium con voces trabajadas, packs Pro con capacidades avanzadas. Creadores externos pasan curaduría y nos llevamos comisión.

**Agentes empresariales.** Cada practicante nuevo en una empresa recibe un agente pre-configurado con el conocimiento del rubro. Cada junior tiene un senior virtual al lado. La capacitación deja de ser un curso de tres días y se vuelve una relación continua. Setup alto, mantenimiento mensual.

**Donaciones.** Modelo típico open source. GitHub Sponsors, patrocinios corporativos.

### Diferenciación (30s)
- Contra Cursor: nosotros vivimos fuera del editor y crecemos hacia otras profesiones
- Contra ChatGPT: identidad estable, permisos granulares, código auditable
- Contra Character.ai: hacemos trabajo real, no solo compañía
- Contra otros proyectos libres: identidad con personajes, voz, y modelo comercial serio

### Cierre (30s)
Este MVP es el pack de desarrollo. Es donde empezamos porque es donde tenemos autoridad técnica. Pero la arquitectura es la misma para cualquier profesión. La visión no es un mejor asistente de IA — es la capa por defecto entre una persona y su computadora. Libre, con cara, con voz, y con los permisos que ella eligió.

## Frases guardables

Para el hero de la landing:
> "Tu compañero de trabajo. Con la cara y voz que elegís. Libre y auditable."

Para el sub-hero:
> "El Compañero conoce tu trabajo, respeta tus permisos, y crece con vos."

Para redes sociales:
> "Le dimos personalidad al asistente. Y encima es open source."
> "El primer asistente de IA que podés leer por dentro."
> "Elegís quién es. Elegís qué puede hacer. Trabaja al lado tuyo."

Para inversores/jueces comerciales:
> "Marketplace curado con comisión + agentes empresariales pre-configurados + donaciones. Tres motores de ingresos sobre un core libre."

Para posicionar contra competencia:
> "Cursor es velocidad. ChatGPT es respuesta. Character.ai es compañía. El Compañero es las tres — con código abierto."

## Nota técnica

"Qué puede tocar" hoy es un permiso a nivel de aplicación (flag en base de datos), no un permiso real del sistema operativo. Hay un plan concreto para que sea literal — escritorio con permisos granulares reales, revocables y auditables — en `DESKTOP-MIGRATION-PLAN.md` (raíz del repo). No prometerlo como ya construido; hoy es MVP web.

## Qué NUNCA decir

- No prometer features que no están (multi-vertical implementado, pagos reales)
- No mencionar "Wuju" en el pitch — el producto se llama El Compañero
- No comparar directo con marcas registradas de forma peyorativa ("mejor que X")
- No decir que "reemplaza" a devs, marketers, etc. — asiste, no reemplaza
