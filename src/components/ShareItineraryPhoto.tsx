'use client';

import { useRef, useState } from 'react';
import { Camera, Download, Share2, X, Loader2, ImageIcon } from 'lucide-react';

interface Trip {
  name: string;
  destination: string;
  days: number;
  start_date?: string;
  end_date?: string;
  itinerary_raw?: string;
  budget?: string;
}

interface RiskScore {
  score: number;
  label: string;
  flag?: string;
  country_name?: string;
}

interface ShareItineraryPhotoProps {
  trip: Trip;
  riskScore?: RiskScore | null;
}

const BUDGET_LABELS: Record<string, string> = {
  low: 'Económico',
  moderate: 'Moderado',
  high: 'Alto',
};

export default function ShareItineraryPhoto({ trip, riskScore }: ShareItineraryPhotoProps) {
  const [open, setOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<HTMLImageElement | null>(null);
  const [userPhotoSrc, setUserPhotoSrc] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo 8MB
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no puede superar 8 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUserPhotoSrc(src);
      const img = new Image();
      img.onload = () => {
        setUserPhoto(img);
        setCanvasUrl(null); // reset preview
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const generateCanvas = async () => {
    if (!userPhoto) return;
    setGenerating(true);

    try {
      const W = 1200;
      const H = 630;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      // Polyfill roundRect para Firefox/Safari
      if (!ctx.roundRect) {
        (ctx as any).roundRect = function(x: number, y: number, w: number, h: number, r: number) {
          this.beginPath();
          this.moveTo(x + r, y);
          this.lineTo(x + w - r, y);
          this.quadraticCurveTo(x + w, y, x + w, y + r);
          this.lineTo(x + w, y + h - r);
          this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          this.lineTo(x + r, y + h);
          this.quadraticCurveTo(x, y + h, x, y + h - r);
          this.lineTo(x, y + r);
          this.quadraticCurveTo(x, y, x + r, y);
          this.closePath();
        };
      };

      // ── Fondo: foto del usuario redimensionada ──────────────────────────
      const scale = Math.max(W / userPhoto.width, H / userPhoto.height);
      const sw = userPhoto.width * scale;
      const sh = userPhoto.height * scale;
      const sx = (W - sw) / 2;
      const sy = (H - sh) / 2;
      ctx.drawImage(userPhoto, sx, sy, sw, sh);

      // ── Overlay degradado oscuro en la mitad inferior ───────────────────
      const grad = ctx.createLinearGradient(0, H * 0.35, 0, H);
      grad.addColorStop(0, 'rgba(15,23,42,0)');
      grad.addColorStop(0.5, 'rgba(15,23,42,0.75)');
      grad.addColorStop(1, 'rgba(15,23,42,0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // ── Línea de marca superior ─────────────────────────────────────────
      ctx.fillStyle = 'rgba(99,102,241,0.85)';
      ctx.fillRect(0, 0, W, 5);

      // ── Flag + destino ──────────────────────────────────────────────────
      ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textBaseline = 'alphabetic';
      const flag = riskScore?.flag || '✈';
      ctx.fillText(flag, 48, H - 220);

      ctx.font = 'bold 44px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      const dest = trip.destination.length > 30 ? trip.destination.slice(0, 28) + '…' : trip.destination;
      ctx.fillText(dest, 48, H - 160);

      // ── Nombre del viaje ────────────────────────────────────────────────
      ctx.font = '26px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.9)';
      const tripName = trip.name.length > 50 ? trip.name.slice(0, 48) + '…' : trip.name;
      ctx.fillText(tripName, 48, H - 118);

      // ── Pills de info: días / presupuesto / riesgo ──────────────────────
      const pills: string[] = [
        `${trip.days} ${trip.days === 1 ? 'día' : 'días'}`,
      ];
      if (trip.budget) pills.push(BUDGET_LABELS[trip.budget] || trip.budget);
      if (riskScore) pills.push(`Seguridad ${riskScore.score}/100`);

      ctx.font = '500 20px system-ui, -apple-system, sans-serif';
      let px = 48;
      const py = H - 72;
      for (const pill of pills) {
        const tw = ctx.measureText(pill).width;
        const pw = tw + 28;
        const ph = 34;
        // Fondo pill
        ctx.fillStyle = 'rgba(99,102,241,0.35)';
        ctx.beginPath();
        ctx.roundRect(px, py - ph + 6, pw, ph, 8);
        ctx.fill();
        // Borde pill
        ctx.strokeStyle = 'rgba(99,102,241,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Texto pill
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(pill, px + 14, py);
        px += pw + 12;
      }

      // ── Marca inferior derecha ──────────────────────────────────────────
      ctx.font = '500 18px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.textAlign = 'right';
      ctx.fillText('viajeinteligencia.com', W - 40, H - 32);

      // ── Exportar a JPEG ~85% ────────────────────────────────────────────
      const url = canvas.toDataURL('image/jpeg', 0.85);
      setCanvasUrl(url);

      // Detectar soporte de Web Share API con ficheros
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
    a.download = `viaje-${trip.destination.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    a.click();
  };

  const handleNativeShare = async () => {
    if (!canvasUrl) return;
    try {
      const byteString = atob(canvasUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'image/jpeg' });
      const file = new File([blob], `viaje-${trip.destination.replace(/\s+/g,'-')}.jpg`, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mi viaje a ${trip.destination}`,
          text: `${trip.days} días en ${trip.destination} — viajeinteligencia.com`,
          files: [file],
        });
      } else {
        await navigator.share({
          title: `Mi viaje a ${trip.destination}`,
          text: `${trip.days} días en ${trip.destination} — viajeinteligencia.com`,
          url: `https://www.viajeinteligencia.com`,
        });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') handleDownload();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-sm transition-colors"
        title="Compartir foto del viaje"
      >
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">Foto</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-slate-700 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Compartir imagen del viaje
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info del viaje */}
            <div className="bg-slate-900/60 rounded-xl px-4 py-3 text-sm text-slate-300 space-y-1">
              <p className="font-semibold text-white">{trip.name}</p>
              <p className="text-slate-400">{trip.destination} · {trip.days} días {riskScore ? `· Seguridad ${riskScore.score}/100` : ''}</p>
            </div>

            {/* Upload foto */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                1. Elige una foto de tu viaje
              </p>
              <label className="cursor-pointer flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl transition-colors text-sm text-slate-400 hover:text-slate-200">
                <Camera className="w-5 h-5 shrink-0" />
                <span>{userPhotoSrc ? '✓ Foto cargada — pulsa para cambiar' : 'Seleccionar foto (máx. 8 MB)'}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
              {userPhotoSrc && (
                <img
                  src={userPhotoSrc}
                  alt="preview"
                  className="mt-3 w-full h-32 object-cover rounded-lg border border-slate-600"
                />
              )}
            </div>

            {/* Generar */}
            {userPhoto && !canvasUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  2. Genera la imagen
                </p>
                <button
                  onClick={generateCanvas}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                >
                  {generating
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
                    : <><ImageIcon className="w-4 h-4" /> Crear imagen</>
                  }
                </button>
              </div>
            )}

            {/* Preview + acciones */}
            {canvasUrl && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Vista previa
                </p>
                <img
                  src={canvasUrl}
                  alt="Imagen generada"
                  className="w-full rounded-xl border border-slate-600 shadow-lg"
                />
                <div className="space-y-2">
                  <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Compartir imagen
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" /> Descargar imagen
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Descarga la imagen y adjúntala en WhatsApp, Instagram o Telegram
                </p>
                {/* Regenerar con otra foto */}
                <button
                  onClick={() => { setCanvasUrl(null); setUserPhoto(null); setUserPhotoSrc(null); }}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
                >
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
