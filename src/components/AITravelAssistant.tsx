'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, X, Send, Loader2 } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '¡Hola! Soy tu asistente de viajes IA. Puedo ayudarte con:\n\n• Recomendaciones de destinos según tu perfil\n• Nivel de riesgo de países\n• Requisitos de visado\n• Consejos de seguridad\n• Presupuesto estimado\n\n¿Qué país te interesa?'
};

export default function AITravelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => m.content),
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Lo siento, no pude procesar tu solicitud. Intenta de nuevo.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Verifica tu conexión e intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-20 left-4 z-40 md:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity"
          >
            <Bot className="w-6 h-6" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4 md:p-0">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md h-[80vh] md:h-[600px] flex flex-col border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Asistente de Viajes IA</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`${msg.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg max-w-[85%] text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mr-auto">
                  <div className="inline-block px-4 py-2 rounded-lg bg-slate-700 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ej: ¿Es seguro viajar a Japón?"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2 text-center">
                <Link href="/premium" className="hover:text-purple-400">Ver versión completa en Premium</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}