import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);
    
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If already installed, don't show anything
    if (isInStandaloneMode) return;

    // Handle Android/Desktop install prompt
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show the prompt after a short delay if not standalone
    if (isIosDevice && !isInStandaloneMode) {
        // Only show once per session or use local storage to limit frequency
        // For now, we'll just show it
        const hasSeenPrompt = sessionStorage.getItem('iosPwaPromptSeen');
        if (!hasSeenPrompt) {
            setTimeout(() => setIsVisible(true), 3000);
        }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
      setIsVisible(false);
      if (isIOS) {
          sessionStorage.setItem('iosPwaPromptSeen', 'true');
      }
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                <Download size={20} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-zinc-100">Install PulseForge</h3>
                <p className="text-xs text-zinc-400 mt-1">
                    {isIOS 
                        ? "Install this app on your iPhone for the best experience." 
                        : "Install PulseForge for a better experience with offline access."
                    }
                </p>
            </div>
        </div>
        <button onClick={handleClose} className="text-zinc-500 hover:text-white">
            <X size={16} />
        </button>
      </div>
      
      {isIOS ? (
         <div className="text-xs text-zinc-400 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
            <p className="flex items-center gap-2 mb-2">
                1. Tap the <Share size={14} className="text-primary" /> button
            </p>
            <p className="flex items-center gap-2">
                2. Select <span className="font-bold text-zinc-300">Add to Home Screen</span>
            </p>
         </div>
      ) : (
        <button 
            onClick={handleInstallClick}
            className="w-full py-2 bg-primary text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
        >
            Install Now
        </button>
      )}
    </div>
  );
};
