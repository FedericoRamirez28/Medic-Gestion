// src/lib/faq.ts
export type FAQ = { q: string; a: string; keys: string[] };

export const faqs: FAQ[] = [
  {
    q: '¿Cómo afiliarse a nuestro plan?',
    a: `🧾 ¿Cómo afiliarse a nuestro plan?

Podés hacerlo de estas formas:

1) Desde la app:
   • Ingresá a la pestaña “Mi Plan” → “Afiliarse”.
   • Completá tus datos (personales y de contacto).
   • Elegí el plan que mejor se adapte a vos.
   • Confirmá la forma de pago.

2) Por WhatsApp:
   • Escribinos al +54 9 11 3636-3342 y te guiamos paso a paso.

3) Telefónicamente:
   • Llamanos al +54 11 3636-3342 (de 9:00 a 18:00).

Tips útiles:
• Tené a mano tu DNI y los datos de contacto.
• Si tenés obra social/plan previo, indicá desde cuándo querés iniciar la cobertura.
• Ante cualquier duda, podés consultarnos por WhatsApp 24 hs.`,
    keys: ['afiliar', 'afiliacion', 'afiliación', 'afiliarse', 'plan', 'alta', 'inscribirme', 'inscripción'],
  },
  {
    q: '¿Dónde veo los prestadores?',
    a: 'En la pestaña “Prestadores” podés buscar por especialidad y zona.',
    keys: ['prestador', 'prestadores', 'cartilla', 'medicos', 'médicos', 'clinica', 'clínica', 'sanatorio'],
  },
  {
    q: 'Credencial digital',
    a: 'Tu credencial digital está en la pestaña “Credencial”. Si no carga, verificá tu conexión y reingresá a la app.',
    keys: ['credencial', 'carnet', 'digital', 'qr', 'tarjeta'],
  },
  {
    q: 'Farmacias',
    a: 'Encontrás la farmacia de turno y la farmacia adherida en la pestaña “Farmacias”.',
    keys: ['farmacia', 'farmacias', 'receta', 'medicamentos'],
  },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function faqAnswer(msg: string): string | null {
  const t = normalize(msg);
  const item = faqs.find(f =>
    f.keys.some(k => t.includes(normalize(k)))
  );
  return item?.a ?? null;
}
