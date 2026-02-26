import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

// Base URL desde .env
const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.medic.com.ar').replace(/\/+$/, '');

// Endpoints oficiales
const EP_GET_BY_DNI = '/api/servicios/getinfobydni';
const EP_GET_BY_SOCIO = '/api/servicios/getinfobysocio';

/** ===================== DEMO USER ===================== */
const DEMO_DNI = '22222222';
const DEMO_USER = {
  uid: 'demo',
  dni: DEMO_DNI,
  nombre: 'Usuario Demo',
  apellido: undefined,
  plan: 'Rubí',
  numero_contrato: '00999999', // ficticio
  habilitado: true,
};

export type User = {
  nombre: string;
  dni: string;
  apellido?: string;
  uid: string; // dni o numero_contrato
  plan?: string;
  numero_contrato?: string;
  habilitado?: boolean;
};

type LoginArgs = string | { dni?: string; numeroSocio?: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (args: LoginArgs) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem('@medic_user');
        if (json) {
          const parsed = JSON.parse(json);

          // ✅ Normalizamos uid siempre
          const uid: string = String(parsed?.uid ?? parsed?.dni ?? 'guest');

          // ✅ Si venía guardado el demo, lo restauramos correcto
          if (String(parsed?.dni ?? '') === DEMO_DNI || uid === 'demo') {
            setUser({ ...(DEMO_USER as User) });
          } else {
            setUser({ ...parsed, uid });
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isEnabled = (v: any) => v === true || v === 'true' || v === 1 || v === '1';

  const mapBackendToUser = (data: any, fallbackId: string): User => {
    const dni = (data?.dni ?? '').toString();
    const numero_contrato = (data?.numero_contrato ?? '').toString();
    const uid = dni || numero_contrato || fallbackId;

    return {
      uid,
      dni: dni || fallbackId,
      nombre: data?.nombre ?? data?.razonSocial ?? 'Afiliado',
      apellido: data?.apellido ?? undefined,
      plan: data?.plan,
      numero_contrato: numero_contrato || undefined,
      habilitado: isEnabled(data?.habilitado),
    };
  };

  const postJSON = async (url: string, body: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }
    return { ok: res.ok, status: res.status, data };
  };

  // Login por DNI o por SOCIO
  const login = async (args: LoginArgs) => {
    try {
      let dni = '';
      let numeroSocio = '';

      if (typeof args === 'string') {
        dni = args.replace(/\D/g, '');
      } else {
        dni = (args.dni || '').replace(/\D/g, '');
        numeroSocio = (args.numeroSocio || '').toString().trim(); // conservar 0s a la izquierda
      }

      if (!dni && !numeroSocio) {
        return { ok: false, message: 'Ingresá tu DNI o N° de afiliado.' };
      }

      /** ===================== DEMO LOGIN (DNI 22222222) ===================== */
      if (dni === DEMO_DNI) {
        const u: User = { ...(DEMO_USER as User) };
        await AsyncStorage.setItem('@medic_user', JSON.stringify(u));
        setUser(u);
        return { ok: true };
      }

      // 1) Si viene numeroSocio, validamos por socio
      if (numeroSocio) {
        const { ok, data } = await postJSON(`${API_BASE}${EP_GET_BY_SOCIO}`, { numeroSocio });
        if (!ok || !data) return { ok: false, message: 'No se pudo consultar tus datos.' };
        if (!isEnabled(data?.habilitado)) return { ok: false, message: data?.message ?? 'Afiliado no habilitado.' };

        const u = mapBackendToUser(data, numeroSocio);
        await AsyncStorage.setItem('@medic_user', JSON.stringify(u));
        setUser(u);
        return { ok: true };
      }

      // 2) Sino, por DNI
      if (dni) {
        const { ok, data } = await postJSON(`${API_BASE}${EP_GET_BY_DNI}`, { numeroDni: dni });
        if (!ok || !data) return { ok: false, message: 'No se pudo consultar tus datos.' };
        if (!isEnabled(data?.habilitado)) return { ok: false, message: data?.message ?? 'Afiliado no habilitado.' };

        const u = mapBackendToUser(data, dni);
        await AsyncStorage.setItem('@medic_user', JSON.stringify(u));
        setUser(u);
        return { ok: true };
      }

      return { ok: false, message: 'Faltan datos para iniciar sesión.' };
    } catch {
      return { ok: false, message: 'Error de conexión' };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@medic_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
