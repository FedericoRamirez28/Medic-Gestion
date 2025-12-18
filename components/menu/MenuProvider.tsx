import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type MenuCtx = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
};

const Ctx = createContext<MenuCtx | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, set] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => set(true),
      close: () => set(false),
      toggle: () => set((v) => !v),
    }),
    [isOpen]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMenu = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMenu debe usarse dentro de <MenuProvider>');
  return ctx;
};
