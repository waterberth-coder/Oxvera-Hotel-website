export interface SpaService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

export const DEFAULT_SPA_SERVICES: SpaService[] = [
  {
    id: 'spa-1',
    name: 'Deep Swedish Healing Massage',
    description: 'Complete physical relief using customized deep-tissue pressure and essential essential oil infuses.',
    price: 35000,
    duration: '90 Mins'
  },
  {
    id: 'spa-2',
    name: 'Hammam Steam Bath & Scrub',
    description: 'Rejuvenating steam system therapy, organic salt scrubs, and complete body exfoliation.',
    price: 25000,
    duration: '60 Mins'
  },
  {
    id: 'spa-3',
    name: 'Oceanic Pearl Facial Peel',
    description: 'Bespoke facial masks designed for deep skin hydration, detoxing, and instant anti-ageing glows.',
    price: 20000,
    duration: '45 Mins'
  },
  {
    id: 'spa-4',
    name: 'Sensory Aromatherapy Suite',
    description: 'Relaxing massage suite featuring micro-mists, targeted sensory sounds, and calming herbal extracts.',
    price: 40000,
    duration: '90 Mins'
  }
];
