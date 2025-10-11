import { useEffect, useState } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithPWA extends Navigator {
  getInstalledRelatedApps?: () => Promise<any[]>;
}

interface WindowWithPWA extends Window {
  deferredPrompt?: PWAInstallPrompt;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = async () => {
      const nav = navigator as NavigatorWithPWA;
      if (nav.getInstalledRelatedApps) {
        try {
          const relatedApps = await nav.getInstalledRelatedApps();
          setIsInstalled(relatedApps.length > 0);
        } catch (error) {
          console.log('Error checking installed apps:', error);
        }
      }
      
      // Alternative check for standalone mode
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as WindowWithPWA).deferredPrompt = e as unknown as PWAInstallPrompt;
      setIsInstallable(true);
      console.log('🏨 PWA install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      console.log('🎉 BarConnect PWA installed successfully!');
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('🔧 Service Worker registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  console.log('🔄 App update available');
                }
              });
            }
          });

          // Handle service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
              console.log('📦 Cache updated');
            }
          });

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      }
    };

    // Online/Offline status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📱 Gone offline');
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial checks
    checkInstallStatus();
    registerServiceWorker();
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    const windowWithPWA = window as WindowWithPWA;
    const deferredPrompt = windowWithPWA.deferredPrompt;
    
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('🎉 User accepted PWA install');
        setIsInstallable(false);
        windowWithPWA.deferredPrompt = undefined;
        return true;
      } else {
        console.log('❌ User dismissed PWA install');
        return false;
      }
    } catch (error) {
      console.error('❌ Error during PWA install:', error);
      return false;
    }
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const shareApp = async (data?: { title?: string; text?: string; url?: string }) => {
    const shareData = {
      title: data?.title || 'BarConnect - Sistema de Gestão',
      text: data?.text || 'Gerencie seu bar/restaurante com eficiência!',
      url: data?.url || window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('📤 App shared successfully');
        return true;
      } else {
        // Fallback for browsers without Web Share API
        await navigator.clipboard.writeText(shareData.url);
        console.log('📋 Link copied to clipboard');
        return true;
      }
    } catch (error) {
      console.error('❌ Error sharing app:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    updateApp,
    shareApp,
  };
};

export default usePWA;