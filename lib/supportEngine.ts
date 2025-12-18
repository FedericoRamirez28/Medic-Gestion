// src/lib/supportEngine.ts
import { faqAnswer } from './faq';
import { config, isFeriadoHoy } from './supportConfig';

export type Intent =
  | 'ambulancia'
  | 'reclamos'
  | 'comercial'
  | 'faq'
  | 'mi_plan'
  | 'mi_estado'
  | 'mi_credencial'
  | 'desconocido';

export type Action = {
  message: string;
  call?: string;
  whatsapp?: string;
  intent?: Intent;
  meta?: Record<string, any>;
};

const dict: Record<Intent, string[]> = {
  ambulancia: ['ambulancia','emergencia','urgencia','despacho'],
  reclamos:   ['reclamo','queja','atención','socio','farmacia'],
  comercial:  ['comercial','afiliar','plan','venta','cotizar','afiliación','afiliarse','inscripción','inscribirme'],
  faq:        ['horario','prestadores','farmacias','credencial','afiliación','cartilla','qr','carnet','cómo afiliarse','como afiliarse'],
  mi_plan:    ['mi plan','plan actual','qué plan tengo','cual es mi plan'],
  mi_estado:  ['mi estado','estado de cuenta','vigencia','cobertura','estoy al día','adeudo','deuda'],
  mi_credencial: ['mi credencial','credencial digital','mostrar credencial'],
  desconocido: [],
};

export function detectIntent(q: string): Intent {
  const t = q.toLowerCase();
  for (const intent of [
    'ambulancia','reclamos','comercial','mi_plan','mi_estado','mi_credencial','faq'
  ] as Intent[]) {
    if (dict[intent].some(k => t.includes(k))) return intent;
  }
  return 'desconocido';
}

export function withinHours(now = new Date()) {
  const h = now.getHours();
  const { start, end } = config.horario;
  if (isFeriadoHoy(now)) return false;
  return h >= start && h < end;
}

export function respond(q: string, now = new Date()): Action {
  const intent = detectIntent(q);

  if (intent === 'faq') {
    const a = faqAnswer(q);
    if (a) return { intent, message: a };
  }

  if (intent === 'mi_plan') {
    return { intent, message: 'Consulto tu plan…', meta: { requiresDni: true, feature: 'mi_plan' } };
  }
  if (intent === 'mi_estado') {
    return { intent, message: 'Verifico tu estado y vigencia…', meta: { requiresDni: true, feature: 'mi_estado' } };
  }
  if (intent === 'mi_credencial') {
    return { intent, message: 'Busco tu credencial digital…', meta: { requiresDni: true, feature: 'mi_credencial' } };
  }

  if (intent === 'ambulancia') {
    return { intent, message: config.mensajes.ambulancia, call: config.canales.ambulancia.phone };
  }

  if (intent === 'reclamos' || intent === 'comercial') {
    const canal = config.canales[intent];

    if (!withinHours(now)) {
      const text = intent === 'reclamos'
        ? 'Hola, quiero hacer un reclamo.'
        : 'Hola, quiero hacer una consulta comercial.';
      return {
        intent,
        message: `${config.mensajes.fueraHorario}\n${config.mensajes.derivarWhatsApp}`,
        whatsapp: `https://wa.me/${canal.wa}?text=${encodeURIComponent(text)}`
      };
    }

    return { intent, message: `📞 ${canal.phone}\n¿Querés llamar ahora?`, call: canal.phone };
  }

  const a = faqAnswer(q);
  if (a) return { intent: 'faq', message: a };

  return {
    intent: 'desconocido',
    message: 'No llegué a entender. Probá con: "ambulancia", "reclamos", "comercial", "mi plan" o "mi credencial".'
  };
}
