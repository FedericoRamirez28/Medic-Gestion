// src/lib/supportConfig.ts

export const config = {
  horario: { start: 9, end: 18, tz: 'America/Argentina/Buenos_Aires' },

  feriadosISO: [
    '2025-10-13',
    '2025-11-17',
  ],

  mensajes: {
     coberturaDisclaimer:
    'La cobertura exacta puede variar según el plan y la práctica. Algunas requieren autorización previa.',
  coberturaHowTo:
    'Decime qué práctica necesitás (ej: resonancia, laboratorio, odontología) y te explico cómo gestionarlo.',

    fueraHorario:
      'Nuestro horario de atención administrativa es de 9:00 a 18:00 hs.',
    ambulancia:
      'El servicio de despacho de emergencias se encuentra disponible las 24 hs.',
    derivarWhatsApp:
      'Te derivamos a WhatsApp para que dejes tu consulta y sea respondida en el próximo horario hábil.',
  },

  canales: {
    reclamos: {
      phone: '+54 11 2031-8064',
      wa: '5491120318064',
    },
    comercial: {
      phone: '+54 11 3636-3342',
      wa: '5491136363342',
    },
    ambulancia: {
      phone: '+54 11 7078-6200',
      wa: '5491170786200',
    },
  },
};

export const isFeriadoHoy = (d = new Date()) => {
  const iso = d.toISOString().slice(0, 10);
  return config.feriadosISO.includes(iso);
};
