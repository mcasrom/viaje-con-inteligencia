'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, ChevronRight } from 'lucide-react';

const ALL_ROUTES = [
  { id: 'molinos', title: 'Ruta de los Molinos', region: 'La Mancha', days: '4-5', km: '450', desc: 'Molinos monumentales de La Mancha.' },
  { id: 'faros', title: 'Ruta de los Faros', region: 'Costa España', days: '5-7', km: '2100', desc: 'Los faros más emblemáticos.' },
  { id: 'murcia', title: 'Ruta de Murcia', region: 'Murcia', days: '3-4', km: '280', desc: 'Caravaca, Calasparra, Moratalla.' },
  { id: 'rioja', title: 'Ruta del Vino', region: 'La Rioja', days: '3-4', km: '200', desc: 'Bodegas y viñedos.' },
  { id: 'pirineos', title: 'Ruta de Nieve', region: 'Pirineos', days: '5-7', km: '350', desc: 'Estaciones de esquí.' },
  { id: 'costa', title: 'Best Beaches', region: 'Costa del Sol', days: '4-5', km: '300', desc: 'Las mejores playas.' },
  { id: 'norte', title: 'Gran Ruta Verde', region: 'España Verde', days: '7-10', km: '800', desc: 'Costa cantábrica.' },
  { id: 'patrimonio', title: 'Ciudades Patrimonio', region: 'Centro', days: '5-6', km: '600', desc: 'Toledo, Ávila, Salamanca.' },
];

const COLORS = ['from-amber-600 to-orange-600', 'from-cyan-600 to-blue-600', 'from-emerald-600 to-teal-600', 'from-red-600 to-rose-600', 'from-blue-600 to-indigo-600', 'from-yellow-500 to-orange-600', 'from-green-600 to-emerald-600', 'from-purple-600 to-violet-600'];

const RutasClient = dynamic(() => import('./RutasClient'), { ssr: false });

export default function RutasPage() {
  return <RutasClient />;
}