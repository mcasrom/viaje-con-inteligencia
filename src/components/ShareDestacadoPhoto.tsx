'use client';

import { useRef, useState } from 'react';
import { Camera, Download, Share2, X, Loader2, ImageIcon } from 'lucide-react';

interface ShareDestacadoPhotoProps {
  trip: {
    name: string;
    destination: string;
    days: number;
    budget?: string;
    slug: string;
  };
}

const BUDGET_LABELS: Record<string, string> = {
  low: 'Económico', moderate: 'Moderado', high: 'Alto',
};

export default function ShareDestacadoPhoto({ trip }: ShareDestacadoPhotoProps) {
  const [open, setOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<HTMLImageElement | null>(null);
  const [userPhotoSrc, setUserPhotoSrc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Máximo 8 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUserPhotoSrc(src);
      const img = new Image();
      img.onload = () => { setUserPhoto(img); setCanvasUrl(null); };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const generateCanvas = async () => {
    setGenerating(true);
    try {
      const W = 1200; const H = 630;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // Polyfill roundRect
      if (!ctx.roundRect) {
        (ctx as any).roundRect = function(x: number, y: number, w: number, h: number, r: number) {
          this.beginPath();
          this.moveTo(x + r, y); this.lineTo(x + w - r, y);
          this.quadraticCurveTo(x + w, y, x + w, y + r);
          this.lineTo(x + w, y + h - r);
          this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          this.lineTo(x + r, y + h);
          this.quadraticCurveTo(x, y + h, x, y + h - r);
          this.lineTo(x, y + r);
          this.quadraticCurveTo(x, y, x + r, y);
          this.closePath();
        };
      }

      if (userPhoto) {
        // Fondo: foto del usuario
        const scale = Math.max(W / userPhoto.width, H / userPhoto.height);
        const sw = userPhoto.width * scale; const sh = userPhoto.height * scale;
        ctx.drawImage(userPhoto, (W - sw) / 2, (H - sh) / 2, sw, sh);
      } else {
        // Fondo generado: degradado azul-índigo
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Patrón de puntos decorativo
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        for (let x = 0; x < W; x += 40) {
          for (let y = 0; y < H; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Círculo decorativo grande
        ctx.strokeStyle = 'rgba(99,102,241,0.15)';
        ctx.lineWidth = 60;
        ctx.beginPath();
        ctx.arc(W * 0.75, H * 0.3, 280, 0, Math.PI * 2);
        ctx.stroke();

        // ✈ grande centrado arriba
        ctx.font = '120px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(99,102,241,0.3)';
        ctx.fillText('✈', W * 0.78, H * 0.45);
        ctx.textAlign = 'left';
      }

      // Overlay degradado oscuro inferior
      const overlay = ctx.createLinearGradient(0, H * 0.3, 0, H);
      overlay.addColorStop(0, 'rgba(15,23,42,0)');
      overlay.addColorStop(0.45, 'rgba(15,23,42,0.72)');
      overlay.addColorStop(1, 'rgba(15,23,42,0.97)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);

      // Línea superior índigo
      ctx.fillStyle = 'rgba(99,102,241,0.9)';
      ctx.fillRect(0, 0, W, 5);

      // Destino
      ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'alphabetic';
      const dest = trip.destination.length > 32 ? trip.destination.slice(0, 30) + '…' : trip.destination;
      ctx.fillText(`✈ ${dest}`, 48, H - 200);

      // Nombre del itinerario
      ctx.font = '28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      const name = trip.name.length > 55 ? trip.name.slice(0, 53) + '…' : trip.name;
      ctx.fillText(name, 48, H - 148);

      // Pills
      const pills: string[] = [`${trip.days} ${trip.days === 1 ? 'día' : 'días'}`];
      if (trip.budget) pills.push(BUDGET_LABELS[trip.budget] || trip.budget);
      pills.push('IA + Análisis de riesgo');

      ctx.font = '500 19px system-ui, -apple-system, sans-serif';
      let px = 48; const py = H - 88;
      for (const pill of pills) {
        const tw = ctx.measureText(pill).width;
        const pw = tw + 28; const ph = 34;
        ctx.fillStyle = 'rgba(99,102,241,0.35)';
        ctx.beginPath();
        (ctx as any).roundRect(px, py - ph + 6, pw, ph, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(99,102,241,0.6)';
        ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(pill, px + 14, py);
        px += pw + 12;
      }

      // URL inferior derecha
      ctx.font = '500 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.textAlign = 'right';
      ctx.fillText('viajeinteligencia.com/viajes/destacados', W - 40, H - 32);

      const url = canvas.toDataURL('image/jpeg', 0.87);
      setCanvasUrl(url);

      if (typeof navigator !== 'undefined' && navigator.canShare) {
        const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
        setCanShareFiles(navigator.canShare({ files: [testFile] }));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!canvasUrl) return;
    const a = document.createElement('a');
    a.href = canvasUrl;
    a.download = `itinerario-${trip.destination.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    a.click();
  };

  const handleNativeShare = async () => {
    if (!canvasUrl) return;
    try {
      // Convertir data URL a blob sin fetch (más compatible)
      const byteString = atob(canvasUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'image/jpeg' });
      const file = new File([blob], `itinerario-${trip.destination.replace(/\s+/g,'-')}.jpg`, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Itinerario: ${trip.name}`,
          text: `${trip.days} días en ${trip.destination} — viajeinteligencia.com/viajes/destacados/${trip.slug}`,
          files: [file],
        });
      } else {
        // Fallback: compartir solo enlace
        await navigator.share({
          title: `Itinerario: ${trip.name}`,
          text: `${trip.days} días en ${trip.destination}`,
          url: `https://www.viajeinteligencia.com/viajes/destacados/${trip.slug}`,
        });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') handleDownload();
    }
  };

  const shareUrl = `https://www.viajeinteligencia.com/viajes/destacados/${trip.slug}`;
  const shareText = `🗺 ${trip.name} — ${trip.days} días en ${trip.destination}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Compartir itinerario
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-slate-700 space-y-5"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Compartir itinerario
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info */}
            <div className="bg-slate-900/60 rounded-xl px-4 py-3 text-sm text-slate-300 space-y-1">
              <p className="font-semibold text-white">{trip.name}</p>
              <p className="text-slate-400">{trip.destination} · {trip.days} días</p>
            </div>

            {/* Enlace rápido */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enlace directo</p>
              <div className="flex gap-2">
                <input readOnly value={shareUrl}
                  className="flex-1 bg-slate-900 text-slate-300 px-3 py-2 rounded-lg text-xs border border-slate-600" />
                <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors">
                  Copiar
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank')}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-2 rounded-lg transition-colors">
                  WhatsApp
                </button>
                <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg transition-colors">
                  Telegram
                </button>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-lg transition-colors">
                  X/Twitter
                </button>
              </div>
            </div>

            {/* Foto opcional */}
            {!canvasUrl && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Imagen para compartir
                </p>
                <label className="cursor-pointer flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl transition-colors text-sm text-slate-400 hover:text-slate-200">
                  <Camera className="w-5 h-5 shrink-0" />
                  <span>{userPhotoSrc ? '✓ Foto cargada — pulsa para cambiar' : 'Añadir foto propia (opcional, máx. 8 MB)'}</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {userPhotoSrc && (
                  <img src={userPhotoSrc} alt="preview"
                    className="w-full h-28 object-cover rounded-lg border border-slate-600" />
                )}
                <button onClick={generateCanvas} disabled={generating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                  {generating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
                    : <><ImageIcon className="w-4 h-4" /> {userPhoto ? 'Crear imagen con mi foto' : 'Generar imagen automática'}</>}
                </button>
                <p className="text-xs text-slate-500 text-center">
                  Sin foto propia se genera una imagen con diseño automático del destino
                </p>
              </div>
            )}

            {/* Preview + acciones */}
            {canvasUrl && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vista previa</p>
                <img src={canvasUrl} alt="Imagen generada"
                  className="w-full rounded-xl border border-slate-600 shadow-lg" />
                <div className="space-y-2">
                  <button onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    <Share2 className="w-4 h-4" /> Compartir imagen
                  </button>
                  <button onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    <Download className="w-4 h-4" /> Descargar imagen
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Descarga la imagen y adjúntala en WhatsApp, Instagram o Telegram
                </p>
                <button onClick={() => { setCanvasUrl(null); setUserPhoto(null); setUserPhotoSrc(null); }}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors">
                  Cambiar foto y regenerar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
