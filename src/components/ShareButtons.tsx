'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Mail } from 'lucide-react';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const sizeClasses = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export default function ShareButtons({ 
  title, 
  description = '', 
  url, 
  size = 'md',
  showLabels = false 
}: ShareButtonsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=ViajeIntel2026`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleWebShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: shareUrl,
        });
        setShowOptions(false);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleClick = async () => {
    const shared = await handleWebShare();
    if (!shared) {
      setShowOptions(!showOptions);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors active:scale-95 ${
          showLabels ? 'px-4 py-2' : sizeClasses[size]
        }`}
        aria-label="Compartir"
      >
        <Share2 className={iconSizes[size]} />
        {showLabels && <span>Compartir</span>}
      </button>

      {showOptions && (
        <div className="absolute bottom-full right-0 mb-3 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-50 min-w-[300px]">
          <p className="text-white font-medium mb-3 text-sm">Compartir en:</p>
          
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => { window.open(shareLinks.whatsapp, '_blank'); setShowOptions(false); }}
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-colors group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
              <span className="text-[10px] text-slate-400">WhatsApp</span>
            </button>
            <button
              onClick={() => { window.open(shareLinks.telegram, '_blank'); setShowOptions(false); }}
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-colors group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">✈️</span>
              <span className="text-[10px] text-slate-400">Telegram</span>
            </button>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-colors group"
              onClick={() => setShowOptions(false)}
            >
              <TwitterIcon className="w-5 h-5 text-white group-hover:text-blue-400" />
              <span className="text-[10px] text-slate-400">Twitter/X</span>
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-colors group"
              onClick={() => setShowOptions(false)}
            >
              <FacebookIcon className="w-5 h-5 text-white group-hover:text-blue-600" />
              <span className="text-[10px] text-slate-400">Facebook</span>
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-colors group"
              onClick={() => setShowOptions(false)}
            >
              <LinkedinIcon className="w-5 h-5 text-white group-hover:text-blue-500" />
              <span className="text-[10px] text-slate-400">LinkedIn</span>
            </a>
            <a
              href={shareLinks.email}
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-colors group"
              onClick={() => setShowOptions(false)}
            >
              <Mail className="w-5 h-5 text-white group-hover:text-yellow-400" />
              <span className="text-[10px] text-slate-400">Email</span>
            </a>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-600">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg truncate"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
