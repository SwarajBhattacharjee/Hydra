export interface PlatformCapabilities {
  supportsWebPush: boolean;
  isIOS: boolean;
  isStandalonePWA: boolean;
  needsIOSHomeInstall: boolean;
  permissionState: NotificationPermission | 'unsupported';
}

export function detectPlatformCapabilities(): PlatformCapabilities {
  if (typeof window === 'undefined') {
    return {
      supportsWebPush: false,
      isIOS: false,
      isStandalonePWA: false,
      needsIOSHomeInstall: false,
      permissionState: 'unsupported'
    };
  }

  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  const hasSW = 'serviceWorker' in navigator;
  const hasPush = 'PushManager' in window;
  const hasNotification = 'Notification' in window;

  const supportsWebPush = hasSW && hasPush && hasNotification;
  const needsIOSHomeInstall = isIOS && !isStandalonePWA;
  const permissionState = hasNotification ? Notification.permission : 'unsupported';

  return {
    supportsWebPush,
    isIOS,
    isStandalonePWA,
    needsIOSHomeInstall,
    permissionState
  };
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.error('Service Worker registration failed:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Auto subscribe browser to Web Push
      await subscribeUserToPush();
    }
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const reg = await registerServiceWorker();
    if (!reg) return null;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLF7WgxDdnmFX5VGmtjp1a_4Oom1YbbMgmy_wbneMI_sGZnKtWXtRWsrfias4ibfgKAPrrSCcAcVPPc9kSOzUeg';

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource
      });
    }

    if (subscription) {
      localStorage.setItem('hydra_push_subscription', JSON.stringify(subscription));

      // Sync subscription to backend API
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          subscription
        })
      }).catch((e) => console.warn('Push subscription backend sync warning:', e));
    }

    return subscription;
  } catch (err) {
    console.warn('Web Push subscription failed:', err);
    return null;
  }
}

export async function sendLocalNotification(title: string, options: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Always emit in-app toast event for active tab
  window.dispatchEvent(new CustomEvent('HYDRA_INAPP_NOTIFICATION', {
    detail: { title, body: options.body || '' }
  }));

  if (Notification.permission !== 'granted') {
    return false;
  }

  let shown = false;
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        await reg.showNotification(title, {
          badge: '/icons/icon-192.png',
          icon: '/icons/icon-192.png',
          ...({ vibrate: [100, 50, 100] } as Record<string, unknown>),
          ...options
        } as NotificationOptions);
        shown = true;
      }
    }
  } catch (err) {
    console.warn('SW showNotification fallback:', err);
  }

  if (!shown) {
    try {
      new Notification(title, options);
      shown = true;
    } catch (e) {
      console.warn('Direct Notification fallback warning:', e);
    }
  }

  return shown;
}
