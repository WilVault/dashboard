
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email.trim().toLowerCase());
}

export function formatAmount(value: string, currency: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  let symbol = '';

  switch(currency) {
    case 'PHP':
      symbol = '₱'
      break;
    case 'USD':
      symbol = '$'
      break;
    case 'EUR':
      symbol = '€'
      break;
    case 'JPY':
      symbol = '¥'
      break;
    case 'GBP':
      symbol = '£'
      break;
    case 'SGD':
      symbol = 'S$'
      break;
  }
  return symbol + Math.abs(num).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}