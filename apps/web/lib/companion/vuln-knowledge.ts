// Capa de aprendizaje: explicación educativa por tipo de vulnerabilidad.
// Se matchea por palabras clave del título del finding para enseñarle al usuario
// qué es, por qué importa y cómo prevenirlo en general (no solo el fix puntual).
export type VulnLesson = {
  topic: string;
  why: string;
  prevent: string;
  learnMore?: string;
};

const KB: Array<{ match: RegExp; lesson: VulnLesson }> = [
  {
    match: /sql\s*inject|sqli|injection sql/i,
    lesson: {
      topic: "SQL Injection",
      why: "Un atacante inyecta SQL en tus queries y puede leer, modificar o borrar toda la base de datos, o saltarse el login.",
      prevent:
        "Usá queries parametrizadas / prepared statements (nunca concatenes input en el SQL). Un ORM bien usado ya lo hace.",
      learnMore: "OWASP A03:2021 — Injection",
    },
  },
  {
    match: /xss|cross.?site.?script|script inject/i,
    lesson: {
      topic: "Cross-Site Scripting (XSS)",
      why: "Se inyecta JavaScript malicioso que corre en el navegador de otros usuarios: roba sesiones, cookies o hace acciones en su nombre.",
      prevent:
        "Escapá/encodeá todo output que venga de usuarios. En React evitá dangerouslySetInnerHTML; usá una CSP estricta.",
      learnMore: "OWASP A03:2021 — Injection",
    },
  },
  {
    match: /secret|api.?key|hardcod|password|token|credential/i,
    lesson: {
      topic: "Secretos hardcodeados",
      why: "Claves, passwords o tokens en el código quedan en el repo y el historial de git para siempre — cualquiera con acceso los ve.",
      prevent:
        "Movelos a variables de entorno (.env fuera de git) o un secret manager. Rotá cualquier secreto que ya se haya commiteado.",
      learnMore: "OWASP A07:2021 — Identification & Auth Failures",
    },
  },
  {
    match: /cors/i,
    lesson: {
      topic: "CORS mal configurado",
      why: "Un CORS con '*' permite que cualquier sitio le haga requests autenticados a tu API en nombre del usuario.",
      prevent: "Permití solo los orígenes que confiás. Nunca combines Allow-Origin: * con credenciales.",
    },
  },
  {
    match: /md5|sha1|des|rc4|weak.?(crypt|encryp|hash|key)|crypto/i,
    lesson: {
      topic: "Criptografía débil",
      why: "MD5/SHA1/DES son rompibles hoy. Usarlos para passwords o firmas deja la data efectivamente sin proteger.",
      prevent:
        "Passwords: bcrypt/argon2/scrypt con salt. Cifrado: AES-GCM. Claves fuertes y aleatorias, guardadas seguras.",
    },
  },
  {
    match: /jwt|sign|verif|firma/i,
    lesson: {
      topic: "JWT / firmas sin verificar",
      why: "Si no verificás la firma del token, un atacante forja uno y se hace pasar por cualquier usuario o admin.",
      prevent:
        "Verificá siempre la firma con la clave del servidor. Fijá el algoritmo (no aceptes 'none'). Poné expiración.",
    },
  },
  {
    match: /input|valida|sanitiz|escap/i,
    lesson: {
      topic: "Validación de input faltante",
      why: "Confiar en el input del usuario abre la puerta a inyecciones, corrupción de datos y bypass de reglas.",
      prevent:
        "Validá tipo, rango y formato en el servidor (no solo en el cliente). Sanitizá antes de usar o guardar.",
    },
  },
  {
    match: /path.?travers|directory.?travers|lfi|rfi/i,
    lesson: {
      topic: "Path Traversal",
      why: "Con '../' un atacante sale de la carpeta esperada y lee archivos del sistema (config, /etc/passwd, secretos).",
      prevent: "Normalizá y validá rutas contra una carpeta base permitida. No pases input crudo al filesystem.",
    },
  },
  {
    match: /race.?condition|toctou/i,
    lesson: {
      topic: "Race condition",
      why: "Dos operaciones concurrentes pisan el mismo estado y producen resultados inconsistentes (ej: doble gasto).",
      prevent: "Usá transacciones atómicas, locks o operaciones idempotentes en las secciones críticas.",
    },
  },
  {
    match: /deseriali|xxe/i,
    lesson: {
      topic: "Deserialización insegura / XXE",
      why: "Deserializar data no confiable permite ejecutar código o leer archivos del servidor.",
      prevent: "No deserialices input no confiable. Desactivá entidades externas en parsers XML.",
    },
  },
];

const GENERIC: VulnLesson = {
  topic: "Buenas prácticas de seguridad",
  why: "Toda entrada externa es potencialmente hostil; asumí lo peor y validá en el servidor.",
  prevent: "Principio de menor privilegio, validación de input, secretos fuera del código y dependencias al día.",
};

export function lessonFor(title: string): VulnLesson {
  for (const { match, lesson } of KB) {
    if (match.test(title)) return lesson;
  }
  return GENERIC;
}
