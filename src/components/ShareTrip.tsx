'use client';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase-browser';
import { Share2, Copy, Mail, Check, Loader2, Users, Link as LinkIcon } from 'lucide-react';

interface ShareTripProps {
  tripId: string;
  tripName: string;
}

export function ShareTrip({ tripId, tripName }: ShareTripProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const generateShareLink = async () => {
    const supabase = getBrowserClient();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('shared_trips')
        .select('*')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existing) {
        setShareLink(`${window.location.origin}/viaje-compartido?token=${existing.share_token}`);
        return;
      }

      const token = `trip_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { data, error } = await supabase
        .from('shared_trips')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          share_token: token,
        })
        .select()
        .single();

      if (!error && data) {
        setShareLink(`${window.location.origin}/viaje-compartido?token=${data.share_token}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmailInvite = async () => {
    if (!email || !shareLink) return;

    const supabase = getBrowserClient();
    if (!supabase) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: shareData } = await supabase
        .from('shared_trips')
        .select('id')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single();

      if (shareData) {
        await supabase
          .from('trip_invitees')
          .insert({
            share_id: shareData.id,
            email,
          });

        setInviteSent(true);
        setEmail('');
        setTimeout(() => setInviteSent(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setIsOpen(true);
    if (!shareLink) {
      await generateShareLink();
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
      >
        <Share2 className="w-4 h-4" />
        Invitar amigos
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Compartir viaje
            </h3>
            <p className="text-slate-400 text-sm mb-4">{tripName}</p>

            {/* Share Link */}
            {shareLink ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    Enlace para compartir
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-slate-900 text-slate-300 px-3 py-2 rounded-lg text-sm border border-slate-600"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copied && <p className="text-emerald-400 text-xs mt-1">¡Enlace copiado!</p>}
                </div>

                {/* Email Invite */}
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Invitar por email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amigo@email.com"
                      className="flex-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm border border-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={sendEmailInvite}
                      disabled={loading || !email}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
                    </button>
                  </div>
                  {inviteSent && <p className="text-emerald-400 text-xs mt-1">¡Invitación enviada!</p>}
                </div>

                {/* Quick Share Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(`🛣️ ¡Te invito a este viaje: ${tripName}!`)}`, '_blank')}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    Telegram
                  </button>
                  <button
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`🛣️ ¡Te invito a este viaje: ${tripName}!\n\n${shareLink}`)}`, '_blank')}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <button
                  onClick={generateShareLink}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  Generar enlace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
