export type DniInfo = {
  id?: string;
  dni?: string;
  numero_contrato?: string;
  nombre?: string;
  plan?: string;
  habilitado?: boolean;
  deuda?: string | number;
  [k: string]: any;
};

/**
 * Timeout compatible con React Native / Expo
 * (evita el conflicto de tipos AbortSignal)
 */
function withAbortTimeout<T>(
  make: (signal?: any) => Promise<T>,
  ms = 15000
): Promise<T> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);

  return make(ctrl.signal as any).finally(() => clearTimeout(to));
}

async function fetchText(
  input: string,
  init?: RequestInit,
  signal?: any
) {
  const res = await fetch(input, {
    ...(init || {}),
    signal,
  } as any);

  const text = await res.text();
  return { res, text };
}

function parseJson<T = any>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

/** ✅ Backend soporta POST JSON { numeroDni } */
export async function getInfoByDni(dni: string): Promise<DniInfo | null> {
  const url = 'https://api.medic.com.ar/api/servicios/getinfobydni';

  try {
    const { res, text } = await withAbortTimeout(
      (signal) =>
        fetchText(
          url,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({ numeroDni: dni }),
          },
          signal
        ),
      15000
    );

    console.log('[getInfoByDni]', res.status);

    if (!res.ok) {
      console.log('[getInfoByDni] body:', text?.slice(0, 200));
      return null;
    }

    return parseJson<DniInfo>(text);
  } catch (e: any) {
    console.log('[getInfoByDni] error:', e?.message || String(e));
    return null;
  }
}

/* ===== Helpers ===== */
export function isActiva(x: DniInfo) {
  return !!x?.habilitado;
}

export function deudaToNumber(x: DniInfo) {
  const raw = x?.deuda;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = Number(raw.replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}
