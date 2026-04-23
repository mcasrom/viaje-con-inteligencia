'use client';

import { useCallback, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileDown, Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Trip } from '@/lib/supabase';
import { paisesData, DatoPais } from '@/data/paises';

interface PDFExportButtonProps {
  trip: Trip;
}

const emergencyContacts: Record<string, { name: string; phone: string }> = {
  es: { name: 'Embajada España', phone: '+34 915 879 000' },
  pt: { name: 'Embajada Portugal', phone: '+351 213 942 700' },
  fr: { name: 'Embajada Francia', phone: '+33 1 43 12 22 22' },
  it: { name: 'Embajada Italia', phone: '+39 06 688 171' },
  de: { name: 'Embajada Alemania', phone: '+49 30 830 50' },
  gb: { name: 'Embajada Reino Unido', phone: '+44 20 7930 8200' },
  us: { name: 'Embajada Estados Unidos', phone: '+1 202 483 0100' },
  mx: { name: 'Embajada México', phone: '+52 55 9150 2100' },
  ma: { name: 'Embajada Marruecos', phone: '+212 537 63 21 00' },
};

const checklistItems = [
  'Pasaporte válido (+6 meses)',
  'Billetes avión/tren',
  'Reserva hotel/Airbnb',
  'Seguro viaje',
  'Dinero/tarjetas',
  'Teléfono cargado',
  'Adaptador enchufe',
  'Medicación habitual',
  'Vacunas si requeridas',
  'Copias documentos',
  'Autorización menores',
  'App transporte local',
];

export default function PDFExportButton({ trip }: PDFExportButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getCountryData = (destino: string): DatoPais | null => {
    const codigo = destino.toLowerCase().slice(0, 2);
    return paisesData[codigo] || null;
  };

  const generatePDF = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
      let currentPage = 1;

      const pais = getCountryData(trip.destination);
      const countryCode = pais?.codigo || trip.destination?.toLowerCase().slice(0, 2) || 'xx';

      const checkNewPage = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - 25) {
          pdf.addPage();
          currentPage++;
          y = margin;
          return true;
        }
        return false;
      };

      // ============ PAGE 1: Header + Trip Info + Risk ============
      
      // Header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VIAJE CON INTELIGENCIA', margin, 18);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Itinerario Personalizado', margin, 28);
      
      pdf.setFontSize(10);
      pdf.text('viajeinteligencia.com', pageWidth - margin - 45, 28);

      // Premium Badge
      pdf.setFillColor(234, 179, 8);
      pdf.roundedRect(pageWidth - margin - 30, 8, 28, 8, 1, 1, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PREMIUM', pageWidth - margin - 27, 13.5, { align: 'center' });

      y = 50;

      // Trip Info Box
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
      
      y += 8;
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(trip.name || 'Viaje Sin Nombre', margin + 5, y);
      
      y += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      
      const destinoTexto = `Destino: ${trip.destination}${pais ? ` (${pais.nombre})` : ''}`;
      pdf.text(destinoTexto, margin + 5, y);
      
      y += 5;
      const fechaTexto = trip.start_date 
        ? `Fechas: ${new Date(trip.start_date).toLocaleDateString('es-ES')} - ${trip.end_date ? new Date(trip.end_date).toLocaleDateString('es-ES') : 'Sin definir'}`
        : 'Fechas: Por definir';
      pdf.text(fechaTexto, margin + 5, y);
      
      y += 5;
      const duracionTexto = `Duración: ${trip.days} días`;
      pdf.text(duracionTexto, margin + 5, y);
      
      y += 5;
      const presupuestoTexto = `Presupuesto: ${trip.budget === 'low' ? 'Económico (<50€/dayo)' : trip.budget === 'moderate' ? 'Moderado (50-150€/día)' : 'Alto (>150€/día)'}`;
      pdf.text(presupuestoTexto, margin + 5, y);

      y = 95;

      // Risk Section
      if (pais) {
        const riskColor = pais.nivelRiesgo === 'sin-riesgo' || pais.nivelRiesgo === 'bajo' ? [34, 197, 94] :
                        pais.nivelRiesgo === 'medio' ? [234, 179, 8] :
                        [239, 68, 68];
        
        pdf.setFillColor(...riskColor as [number, number, number]);
        pdf.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`NIVEL DE RIESGO: ${pais.nivelRiesgo.toUpperCase()}`, margin + 5, y + 8);
        
        if (pais.nivelRiesgo === 'medio' || pais.nivelRiesgo === 'alto' || pais.nivelRiesgo === 'muy-alto') {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Consulta recomendaciones MAEC antes de viajar', margin + 65, y + 8);
        }
        
        y += 18;
      }

      // ============ PAGE 2: Itinerary ============
      if (trip.itinerary_raw) {
        checkNewPage(60);
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ITINERARIO', margin, y);
        
        y += 6;
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
        
        y += 5;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        
        const itineraryLines = trip.itinerary_raw.split('\n');
        const maxLineWidth = contentWidth - 5;
        
        for (const line of itineraryLines) {
          if (y > pageHeight - 30) {
            checkNewPage(20);
          }
          
          const lines = pdf.splitTextToSize(line, maxLineWidth);
          for (const l of lines) {
            pdf.text(l, margin, y);
            y += 4;
          }
        }
        
        y += 10;
      }

      // ============ PAGE 3: Checklist + Emergency + Notes ============
      checkNewPage(100);

      // Checklist
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CHECKLIST DE EMBARQUE', margin, y);
      
      y += 6;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      
      y += 8;
      pdf.setFontSize(9);
      
      for (let i = 0; i < checklistItems.length; i++) {
        const col = i < 6 ? 0 : 1;
        const row = i % 6;
        const x = margin + col * (contentWidth / 2);
        const itemY = y + row * 8;
        
        pdf.setFillColor(241, 245, 249);
        pdf.circle(x + 2, itemY - 1.5, 2, 'F');
        pdf.setTextColor(55, 65, 81);
        pdf.setFont('helvetica', 'normal');
        pdf.text(checklistItems[i], x + 6, itemY);
      }

      y += 55;

      // Emergency Contacts
      checkNewPage(40);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CONTACTOS DE EMERGENCIA', margin, y);
      
      y += 6;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      
      y += 10;
      pdf.setFontSize(10);
      
      const emergency = emergencyContacts[countryCode] || emergencyContacts['es'];
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`• ${emergency.name}: `, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(emergency.phone, margin + 38, y);
      
      y += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.text('• Teléfono emergencia local: ', margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(pais?.prefijoTelefono ? `${pais.prefijoTelefono}` : '112', margin + 45, y);

      y += 15;

      // Notes section
      checkNewPage(35);
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('NOTAS PERSONALES', margin, y);
      
      y += 6;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      
      y += 8;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      
      for (let i = 0; i < 5; i++) {
        pdf.rect(margin, y + i * 10, contentWidth, 8);
      }

      // ============ FOOTER (all pages) ============
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFillColor(241, 245, 249);
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Generado por Viaje con Inteligencia • ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} • Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
        
        pdf.setFontSize(7);
        pdf.text(
          'Solo para usuarios Premium',
          pageWidth / 2,
          pageHeight - 2,
          { align: 'center' }
        );
      }

      // Save
      const filename = `${trip.name?.replace(/\s+/g, '_') || 'viaje'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setLoading(false);
    }
  }, [trip, user]);

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-slate-600 disabled:to-slate-600 text-black px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Crown className="w-4 h-4" />
      )}
      Exportar PDF
    </button>
  );
}