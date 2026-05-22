'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Building2, MessageSquare, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ApiLead {
  id: number;
  name: string;
  email: string;
  company: string | null;
  plan_tier: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', contacted: 'Contactado', converted: 'Convertido', rejected: 'Rechazado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  converted: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TIER_LABELS: Record<string, string> = {
  free: 'Free', starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise',
};

export default function ApiLeadsPage() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans/request', {
        headers: { 'x-admin-pw': 'admin' },
      });
      if (res.ok) setLeads(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await fetch('/api/plans/request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-pw': 'admin' },
        body: JSON.stringify({ id, status }),
      });
      await fetchLeads();
    } catch { /* ignore */ }
    setUpdating(null);
  };

  const pending = leads.filter(l => l.status === 'pending').length;
  const contacted = leads.filter(l => l.status === 'contacted').length;
  const converted = leads.filter(l => l.status === 'converted').length;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Leads API B2B</h1>
          </div>
          <button onClick={fetchLeads} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="text-2xl font-bold text-white">{leads.length}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-4">
            <div className="text-2xl font-bold text-amber-400">{pending}</div>
            <div className="text-xs text-slate-400">Pendientes</div>
          </div>
          <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
            <div className="text-2xl font-bold text-blue-400">{contacted}</div>
            <div className="text-xs text-slate-400">Contactados</div>
          </div>
          <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-4">
            <div className="text-2xl font-bold text-green-400">{converted}</div>
            <div className="text-xs text-slate-400">Convertidos</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Cargando...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No hay solicitudes todavía</div>
        ) : (
          <div className="space-y-3">
            {leads.map(lead => (
              <div key={lead.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div>
                      <div className="text-white font-medium">{lead.name}</div>
                      <div className="text-slate-400 text-sm">{lead.email}</div>
                    </div>
                    {lead.company && (
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <Building2 className="w-3.5 h-3.5" />
                        {lead.company}
                      </div>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 font-medium">
                      {TIER_LABELS[lead.plan_tier] || lead.plan_tier}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <a href={`mailto:${lead.email}`} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Enviar email">
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    >
                      {expanded === lead.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expanded === lead.id && (
                  <div className="px-4 pb-4 border-t border-slate-700 pt-3">
                    {lead.message && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Mensaje
                        </div>
                        <p className="text-slate-300 text-sm bg-slate-700/30 rounded-lg p-3">{lead.message}</p>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mb-3">
                      Recibido: {new Date(lead.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex gap-2">
                      {lead.status !== 'contacted' && (
                        <button
                          onClick={() => updateStatus(lead.id, 'contacted')}
                          disabled={updating === lead.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/30 disabled:opacity-50"
                        >
                          <Phone className="w-3.5 h-3.5" /> Marcar contactado
                        </button>
                      )}
                      {lead.status !== 'converted' && (
                        <button
                          onClick={() => updateStatus(lead.id, 'converted')}
                          disabled={updating === lead.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-600/30 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Marcar convertido
                        </button>
                      )}
                      {lead.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(lead.id, 'rejected')}
                          disabled={updating === lead.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium hover:bg-red-600/30 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
