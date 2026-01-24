// src/lib/faq.ts
export type FAQ = {
  id: string;
  q: string;
  a: string;
  keys: string[];
  patterns?: RegExp[];
};

export const faqs: FAQ[] = [
  /* ======================= AFILIACIÓN / COMERCIAL ======================= */
  {
    id: 'afiliar',
    q: '¿Cómo afiliarse a nuestro plan?',
    a: `🧾 ¿Cómo afiliarse a nuestro plan?

Podés hacerlo de estas formas:

1) Desde la app:
   • Ingresá a “Mi Plan” → “Afiliarse”.
   • Completá tus datos y elegí el plan.
   • Confirmá la forma de pago.

2) Por WhatsApp:
   • +54 9 11 3636-3342

3) Telefónicamente:
   • +54 11 3636-3342 (9:00 a 18:00)

Tip:
• Tené DNI y datos de contacto a mano.`,
    keys: [
      'afiliar',
      'afiliacion',
      'afiliación',
      'afiliarse',
      'alta',
      'inscribirme',
      'inscripción',
      'cotizar',
      'precio',
      'planes',
      'me quiero afiliar',
    ],
  },
  {
    id: 'formas_pago',
    q: 'Formas de pago',
    a: `💳 Formas de pago (info general)

Según el plan, suelen existir opciones como:
• Débito automático / transferencia
• Pago mensual (según canal habilitado)

Para conocer opciones y valores actualizados:
• Escribí “comercial” y te derivamos al canal correcto.`,
    keys: ['pago', 'pagar', 'formas de pago', 'debito', 'débito', 'transferencia', 'cuota', 'mensual', 'factura'],
  },

  /* ======================= CREDENCIAL / APP ======================= */
  {
    id: 'credencial',
    q: 'Credencial digital',
    a: `📇 Credencial digital

• Está en la pestaña “Credencial”.
• Si tarda en cargar:
  - Si ya cargó alguna vez, debería abrir incluso sin internet (modo offline).
  - Si es la primera vez, conectate a internet para que quede guardada.
• Si no aparece tu DNI: cerrá sesión e ingresá nuevamente.`,
    keys: ['credencial', 'carnet', 'digital', 'qr', 'tarjeta', 'no carga', 'tarda', 'offline', 'sin conexion', 'sin conexión'],
  },
  {
    id: 'no_puedo_entrar',
    q: 'No puedo ingresar a la app',
    a: `🔐 Problemas para ingresar

Probá esto:
1) Cerrá la app y volvé a abrir.
2) Verificá conexión (WiFi / datos).
3) Cerrá sesión y volvé a iniciar.
4) Si persiste, decime “reclamos” y te paso el canal para que lo revisen.`,
    keys: ['no puedo entrar', 'no inicia', 'login', 'iniciar sesion', 'iniciar sesión', 'error', 'se queda cargando', 'crashea', 'crash'],
  },

  /* ======================= PRESTADORES / CARTILLA (NEUTRO) ======================= */
  {
    id: 'prestadores',
    q: '¿Dónde veo los prestadores?',
    a: `📍 Prestadores / Cartilla

• Entrá a la pestaña “Prestadores”.
• Buscá por nombre, categoría o zona.
• Usá filtros para acotar resultados.

Si no aparece algo que existe:
• Probá sin tildes
• Probá por zona
• Tocá “Limpiar” y buscá de nuevo`,
    keys: ['prestador', 'prestadores', 'cartilla', 'centros', 'servicios', 'sucursal', 'sucursales', 'categoría', 'categoria', 'zona'],
  },

  /* ======================= FARMACIAS (NEUTRO COMO “PUNTOS”) ======================= */
  {
    id: 'puntos',
    q: 'Puntos de atención / Farmacias',
    a: `🏪 Puntos de atención

• En la pestaña correspondiente vas a ver:
  - Dirección y teléfono
  - Horarios de apertura
  - Botón de ubicación (Maps)

Si necesitás uno en una zona puntual, decime barrio/localidad.`,
    keys: ['farmacia', 'farmacias', 'punto', 'puntos', 'atencion', 'atención', 'horario', 'abierto', 'cerrado', 'ubicacion', 'ubicación'],
  },

  /* ======================= TURNOS (NEUTRO COMO “GESTIONES”) ======================= */
  {
    id: 'turnos',
    q: 'Gestiones / Turnos',
    a: `📅 Gestiones / Turnos (general)

Podés gestionarlo por:
• Desde la app (si el módulo está habilitado)
• Por teléfono (si corresponde)
• Por WhatsApp (según disponibilidad)

Decime qué querés gestionar y te indico el canal recomendado.`,
    keys: ['turno', 'turnos', 'cita', 'citas', 'agenda', 'reservar', 'solicitar', 'gestionar', 'gestión', 'gestion'],
  },

  /* ======================= COBERTURA / AUTORIZACIONES / BENEFICIOS ======================= */
  {
    id: 'beneficios',
    q: 'Cobertura / Beneficios / Autorizaciones',
    a: `🧾 Cobertura / beneficios (info general)

La cobertura depende de tu plan y del tipo de servicio.

En general:
• Algunas gestiones requieren autorización previa.
• En ciertos casos puede existir copago/coseguro.

Decime qué querés realizar (ej: “estudio”, “servicio”, “reintegro”, “autorización”) y te digo cómo se gestiona.`,
    keys: [
      'cobertura',
      'beneficio',
      'beneficios',
      'cubre',
      'esta cubierto',
      'está cubierto',
      'autorizacion',
      'autorización',
      'orden',
      'derivacion',
      'derivación',
      'copago',
      'coseguro',
    ],
    patterns: [/\b(cobertura|beneficio|autorizaci[oó]n|reintegro|coseguro|copago)\b/i],
  },
  {
    id: 'reintegros',
    q: 'Reintegros',
    a: `💰 Reintegros (general)

Si tu plan contempla reintegro, normalmente te piden:
• Factura / comprobante
• DNI / Nº de afiliado
• Datos del prestador/servicio

Ojo: no todos los planes tienen reintegro.
Si querés, escribí “mi plan” y lo verificamos con tu DNI.`,
    keys: ['reintegro', 'reintegros', 'me reintegran', 'devolucion', 'devolución', 'factura', 'comprobante'],
  },
  {
    id: 'copago_coseguro',
    q: 'Copago / coseguro',
    a: `💳 Copago / coseguro

• “Copago/coseguro” = monto que abonás además de la cobertura.
• Puede variar según plan y tipo de servicio.

Si me decís qué querés realizar, te digo cómo confirmarlo.`,
    keys: ['copago', 'coseguro', 'cuanto pago', 'cuánto pago', 'pago extra', 'plus'],
  },

  /* ======================= RECLAMOS / SOPORTE ======================= */
  {
    id: 'reclamos',
    q: 'Reclamos',
    a: `📣 Reclamos / soporte

Si tenés un problema con:
• Cobertura/beneficios
• Carga de datos / credencial
• Errores de la app

Decime “reclamos” y te derivo al canal correcto según el horario.`,
    keys: ['reclamo', 'reclamos', 'queja', 'problema', 'soporte', 'ayuda', 'no funciona', 'mal', 'error'],
  },
];

function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreFAQ(msg: string, faq: FAQ): number {
  const t = normalize(msg);
  let score = 0;

  if (faq.patterns?.some((r) => r.test(msg))) score += 4;

  for (const k of faq.keys) {
    const kk = normalize(k);
    if (!kk) continue;

    if (t === kk) score += 8;
    else if (t.includes(kk)) score += kk.length >= 7 ? 5 : 2;
  }

  if (t.includes(normalize(faq.q))) score += 3;

  return score;
}

export function faqAnswer(msg: string): string | null {
  const t = normalize(msg);
  if (!t) return null;

  let best: { item: FAQ; score: number } | null = null;
  for (const f of faqs) {
    const sc = scoreFAQ(msg, f);
    if (!best || sc > best.score) best = { item: f, score: sc };
  }

  if (!best || best.score < 4) return null;
  return best.item.a;
}
