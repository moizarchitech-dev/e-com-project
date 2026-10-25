'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { get } from '@/lib/utils';

const FIELDS: { name: string; label: string; autoComplete: string; span?: boolean }[] = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name', span: true },
  { name: 'line1', label: 'Address', autoComplete: 'address-line1', span: true },
  { name: 'line2', label: 'Apartment, suite (optional)', autoComplete: 'address-line2', span: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'state', label: 'State / region', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country (2 letters)', autoComplete: 'country' },
  { name: 'phone', label: 'Phone (optional)', autoComplete: 'tel', span: true },
];

export default function AddressFields({ register, errors, prefix = '', disabled }: {
  register: UseFormRegister<any>; errors: FieldErrors<any>; prefix?: string; disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELDS.map((f) => {
        const name = prefix ? `${prefix}.${f.name}` : f.name;
        const err = get(errors, name)?.message as string | undefined;
        const id = name.replace('.', '-');
        return (
          <div key={f.name} className={f.span ? 'col-span-2' : ''}>
            <label htmlFor={id} className="label">{f.label}</label>
            <input id={id} className="input" autoComplete={`${prefix === 'billing' ? 'billing ' : prefix === 'shipping' ? 'shipping ' : ''}${f.autoComplete}`}
              disabled={disabled} aria-invalid={!!err} {...register(name)} />
            {err && <p className="field-error" role="alert">{err}</p>}
          </div>
        );
      })}
    </div>
  );
}
