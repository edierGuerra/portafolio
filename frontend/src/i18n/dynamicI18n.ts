import type { Language } from "./translations";

type UnknownRecord = Record<string, unknown>;

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function pickLocalizedField<T extends UnknownRecord>(
  source: T,
  baseField: string,
  language: Language,
): string {
  const localizedFieldName = `${baseField}_${language}`;
  const localizedValue = getString(source[localizedFieldName]);
  if (localizedValue.trim()) {
    return localizedValue;
  }

  const englishValue = getString(source[`${baseField}_en`]);
  if (language === "en" && englishValue.trim()) {
    return englishValue;
  }

  return getString(source[baseField]);
}

export function localizeObjectFields<T extends UnknownRecord>(
  source: T,
  language: Language,
  fields: string[],
): T {
  const clone: UnknownRecord = { ...source };

  for (const field of fields) {
    clone[field] = pickLocalizedField(source, field, language);
  }

  return clone as T;
}

export function localizeArrayFields<T extends UnknownRecord>(
  source: T[],
  language: Language,
  fields: string[],
): T[] {
  return source.map((item) => localizeObjectFields(item, language, fields));
}
