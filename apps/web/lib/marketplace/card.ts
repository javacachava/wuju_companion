export type CardBrand = "visa" | "mastercard" | "amex" | "desconocida";

export type CardErrors = {
  number?: string;
  expiry?: string;
  cvc?: string;
  name?: string;
};

/** Algoritmo de Luhn: valida el dígito verificador del número de tarjeta. */
export function luhnValid(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let value = digits.charCodeAt(i) - 48;
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "desconocida";
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function expiryInFuture(mm: number, yy: number): boolean {
  // yy es de dos dígitos → asumimos 2000+.
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

/**
 * Valida la tarjeta a nivel de formato. NO verifica que la tarjeta exista de
 * verdad — eso requiere un procesador de pago real, que el MVP no tiene.
 */
export function validateCard(input: {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}): CardErrors {
  const errors: CardErrors = {};

  const digits = input.number.replace(/\D/g, "");
  if (!luhnValid(digits)) {
    errors.number = "Número de tarjeta inválido";
  }

  const expiryMatch = input.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!expiryMatch) {
    errors.expiry = "Formato MM/AA";
  } else {
    const mm = Number(expiryMatch[1]);
    const yy = Number(expiryMatch[2]);
    if (mm < 1 || mm > 12) {
      errors.expiry = "Mes inválido";
    } else if (!expiryInFuture(mm, yy)) {
      errors.expiry = "Tarjeta vencida";
    }
  }

  const brand = detectBrand(digits);
  const cvcLength = brand === "amex" ? 4 : 3;
  if (!new RegExp(`^\\d{${cvcLength}}$`).test(input.cvc)) {
    errors.cvc = `${cvcLength} dígitos`;
  }

  if (input.name.trim().length < 2) {
    errors.name = "Ingresá el nombre";
  }

  return errors;
}
