'use client';
import { useEffect, useState } from 'react';

/** True after first client render; avoids hydration mismatch with persisted stores. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
