// Business WhatsApp number: digits only, country code first (the format wa.me expects).
export const WHATSAPP_NUMBER = '916281496238';

export const whatsappLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const AREAS = [
  'MVP Colony', 'Madhurawada', 'Gajuwaka', 'Rushikonda',
  'PM Palem', 'Seethammadhara', 'Dwaraka Nagar', 'Yendada',
];
