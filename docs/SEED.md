# SEED

> Qué datos iniciales tiene la base de datos. Dev E implementa esto en `prisma/seed.ts`.

## Filosofía

El seed cumple dos objetivos:
1. Dar al usuario nuevo un compañero YA armado, no un cuerpo vacío
2. Poblar el marketplace con opciones deseables para que "agregar" tenga sentido

Regla: si el usuario abre la app y elige un nombre, en 5 segundos debe ver una mascota completa con partes puestas, no un placeholder.

## Partes iniciales (isPremium = false)

Estas partes están en la DB desde el seed y se asignan automáticamente al inventario de cualquier Character nuevo.

Total: **15 partes** (3 por categoría × 5 categorías).

### hair (3)
| name       | imageUrl              | price |
|------------|-----------------------|-------|
| Corto      | /parts/hair-corto.png | 0     |
| Largo      | /parts/hair-largo.png | 0     |
| Rizado     | /parts/hair-rizado.png| 0     |

### eyes (3)
| name       | imageUrl                | price |
|------------|-------------------------|-------|
| Grandes    | /parts/eyes-grandes.png | 0     |
| Chicos     | /parts/eyes-chicos.png  | 0     |
| Cerrados   | /parts/eyes-cerrados.png| 0     |

### mouth (3)
| name       | imageUrl                | price |
|------------|-------------------------|-------|
| Sonrisa    | /parts/mouth-sonrisa.png| 0     |
| Seria      | /parts/mouth-seria.png  | 0     |
| Riendo     | /parts/mouth-riendo.png | 0     |

### accessory (3)
| name       | imageUrl                     | price |
|------------|------------------------------|-------|
| Ninguno    | /parts/accessory-ninguno.png | 0     |
| Sombrero   | /parts/accessory-sombrero.png| 0     |
| Corbata    | /parts/accessory-corbata.png | 0     |

### clothing (3)
| name       | imageUrl                | price |
|------------|-------------------------|-------|
| Remera     | /parts/clothing-remera.png | 0  |
| Camisa     | /parts/clothing-camisa.png | 0  |
| Sweater    | /parts/clothing-sweater.png| 0  |

## Partes del marketplace (isPremium = true)

Estas aparecen SOLO en el marketplace. Se agregan al inventario del usuario cuando compra.

Total: **10 partes** (2 por categoría × 5 categorías).

### hair (2)
| name       | imageUrl                | price |
|------------|-------------------------|-------|
| Gorro      | /parts/hair-gorro.png   | 200   |
| Colita     | /parts/hair-colita.png  | 300   |

### eyes (2)
| name       | imageUrl                | price |
|------------|-------------------------|-------|
| Guiño      | /parts/eyes-guino.png   | 250   |
| Lentes     | /parts/eyes-lentes.png  | 400   |

### mouth (2)
| name       | imageUrl                     | price |
|------------|------------------------------|-------|
| Sorprendida| /parts/mouth-sorprendida.png | 200   |
| Pícara     | /parts/mouth-picara.png      | 350   |

### accessory (2)
| name       | imageUrl                       | price |
|------------|--------------------------------|-------|
| Audífonos  | /parts/accessory-audifonos.png | 400   |
| Bufanda    | /parts/accessory-bufanda.png   | 300   |

### clothing (2)
| name       | imageUrl                | price |
|------------|-------------------------|-------|
| Hoodie     | /parts/clothing-hoodie.png| 500 |
| Formal     | /parts/clothing-formal.png| 450 |

## Partes por default al crear un Character

Cuando se crea un Character nuevo (primer usuario en abrir la app con ese nombre), se asignan estas partes iniciales al inventario Y se ponen puestas por default:

| Slot        | Parte por default |
|-------------|-------------------|
| hairId      | Corto             |
| eyesId      | Grandes           |
| mouthId     | Sonrisa           |
| accessoryId | Ninguno           |
| clothingId  | Remera            |

El resto de las partes gratis TAMBIÉN están en el inventario, pero no puestas. El usuario puede cambiarlas desde el wardrobe sin comprar.

## Character de ejemplo para testing

Además de las partes, el seed crea UN Character llamado `demo` con:
- userName: `"demo"`
- personality: `"amigable"`
- voiceId: `"21m00Tcm4TlvDq8ikWAM"` (voz Rachel de ElevenLabs)
- Todas las partes gratis en su inventario
- Partes puestas: las por default

Esto sirve para que Dev C, Dev D y el jurado puedan probar la app sin crear un usuario nuevo. Solo entrar y usar el nombre "demo".

## Mensajes de ejemplo (opcional)

Si sobra tiempo en Dev E, agregar 3-4 mensajes de ejemplo al Character `demo` para que el chat no arranque vacío:

```
[user]: "Hola, ¿qué podés hacer?"
[assistant]: "Hola! Soy tu Compañero. Puedo charlar con vos, revisarte código con el Guardián de código, y en el futuro voy a tener más packs de habilidades. ¿Querés que empecemos por algo?"
[user]: "Contame de vos"
[assistant]: "Soy un asistente libre y auditable. Vos me elegiste la cara y la voz. Y podés decidir en cualquier momento qué puedo ver y qué no. Nada de cajas negras."
```

## Skills activos por default

Al crear un Character nuevo, se crea automáticamente:
- `ActiveSkill { skillKey: "chat-base" }` — el chat siempre está activo

El usuario activa "code-guardian" manualmente cuando lo necesite.

## Notas de implementación para Dev E

1. Usar `prisma.part.upsert` con un identificador único para evitar duplicados si se corre el seed varias veces
2. Usar `prisma.part.createMany` para insertar de una sola vez si es más eficiente
3. Después de crear las partes, para el Character `demo`, hacer `createMany` de InventoryItem
4. Envolver todo en `prisma.$transaction` para que sea atómico
5. Si la DB ya tiene datos, no fallar — usar `skipDuplicates: true`

## Cuando cambian los assets

Si Dev B cambia los nombres de archivo de los assets, Dev E actualiza este documento primero y luego el seed. Ese es el orden.
