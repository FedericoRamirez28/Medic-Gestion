// src/lib/supportEngine.ts
import { faqAnswer } from './faq';
import { config, isFeriadoHoy } from './supportConfig';

export type Intent =
  | 'reclamos'
  | 'comercial'
  | 'faq'
  | 'mi_plan'
  | 'mi_estado'
  | 'mi_credencial'
  | 'cobertura'
  | 'desconocido';

export type Action = {
  message: string;
  call?: string;
  whatsapp?: string;
  intent?: Intent;
  meta?: Record<string, any>;
};

function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const dict: Record<Intent, string[]> = {
  reclamos: ['reclamo', 'reclamos', 'queja', 'problema', 'soporte', 'ayuda', 'no funciona', 'error', 'mal'],
  comercial: ['comercial', 'afiliar', 'afiliacion', 'afiliación', 'cotizar', 'precio', 'planes', 'inscribirme'],
  faq: ['prestadores', 'farmacias', 'puntos', 'credencial', 'turnos', 'horario', 'como', 'cómo'],
  mi_plan: ['mi plan', 'plan actual', 'que plan tengo', 'qué plan tengo', 'cual es mi plan', 'cuál es mi plan'],
  mi_estado: ['mi estado', 'vigencia', 'estado de cobertura', 'estoy al dia', 'estoy al día', 'deuda', 'adeudo'],
  mi_credencial: ['mi credencial', 'credencial digital', 'mostrar credencial', 'abrir credencial'],
  cobertura: ['cobertura', 'beneficio', 'beneficios', 'cubre', 'esta cubierto', 'está cubierto', 'autorizacion', 'autorización', 'reintegro', 'copago', 'coseguro'],
  desconocido: [],
};

function scoreIntent(q: string, intent: Intent): number {
  const t = normalize(q);
  let score = 0;

  for (const k of dict[intent]) {
    const kk = normalize(k);
    if (!kk) continue;

    if (t === kk) score += 10;
    else if (t.includes(kk)) score += kk.length >= 8 ? 6 : 3;
  }

  return score;
}

export function detectIntent(q: string): Intent {
  const intents: Intent[] = ['reclamos', 'comercial', 'mi_plan', 'mi_estado', 'mi_credencial', 'cobertura', 'faq'];

  let best: { intent: Intent; score: number } | null = null;
  for (const i of intents) {
    const sc = scoreIntent(q, i);
    if (!best || sc > best.score) best = { intent: i, score: sc };
  }

  if (!best || best.score < 6) return 'desconocido';
  return best.intent;
}

export function withinHours(now = new Date()) {
  const h = now.getHours();
  const { start, end } = config.horario;
  if (isFeriadoHoy(now)) return false;
  return h >= start && h < end;
}

export function respond(q: string, now = new Date()): Action {
  const intent = detectIntent(q);

  // 1) FAQ primero (si aplica)
  const a = faqAnswer(q);
  if (a && (intent === 'faq' || intent === 'desconocido' || intent === 'cobertura')) {
    return { intent: intent === 'desconocido' ? 'faq' : intent, message: a };
  }

  // 2) Datos del usuario (requiere DNI)
  if (intent === 'mi_plan') {
    return { intent, message: 'Consulto tu plan…', meta: { requiresDni: true, feature: 'mi_plan' } };
  }
  if (intent === 'mi_estado') {
    return { intent, message: 'Verifico tu estado y vigencia…', meta: { requiresDni: true, feature: 'mi_estado' } };
  }
  if (intent === 'mi_credencial') {
    return { intent, message: 'Busco tu credencial digital…', meta: { requiresDni: true, feature: 'mi_credencial' } };
  }

  // 3) Reclamos / comercial (con horario)
  if (intent === 'reclamos' || intent === 'comercial') {
    const canal = config.canales[intent];

    if (!withinHours(now)) {
      const text = intent === 'reclamos'
        ? 'Hola, quiero hacer un reclamo.'
        : 'Hola, quiero hacer una consulta comercial.';
      return {
        intent,
        message: `${config.mensajes.fueraHorario}\n${config.mensajes.derivarWhatsApp}`,
        whatsapp: `https://wa.me/${canal.wa}?text=${encodeURIComponent(text)}`,
      };
    }

    return { intent, message: `📞 ${canal.phone}\n¿Querés llamar ahora?`, call: canal.phone };
  }

  // 4) Cobertura / beneficios (guía simple)
  if (intent === 'cobertura') {
    return {
      intent,
      message:
        `🧾 Cobertura / beneficios\n\n` +
        `Decime qué querés realizar (ej: “autorización”, “reintegro”, “copago/coseguro”, “servicio X”) y te digo:\n` +
        `• cómo se gestiona\n` +
        `• qué datos suelen pedir\n\n` +
        `Si además me pasás tu DNI (“mi dni es …”), puedo verificar tu plan/estado.`,
      meta: { requiresDni: false },
    };
  }

  // 5) fallback útil
  return {
    intent: 'desconocido',
    message:
      `No llegué a entender del todo 😅\n\n` +
      `Probá con:\n` +
      `• “reclamos”\n` +
      `• “comercial”\n` +
      `• “mi plan” / “mi estado”\n` +
      `• “mi credencial”\n` +
      `• “cobertura” / “beneficios” / “reintegro”\n\n` +
      `Decime qué necesitás y te guío.`,
  };
}
