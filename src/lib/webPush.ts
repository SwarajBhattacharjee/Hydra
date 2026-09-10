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
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
}

export async function sendLocalNotification(title: string, options: NotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') {
    return false;
  }

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    if (reg) {
      await reg.showNotification(title, {
        badge: '/icons/icon-192.png',
        icon: '/icons/icon-192.png',
        ...({ vibrate: [100, 50, 100] } as Record<string, unknown>),
        ...options
      } as NotificationOptions);
      return true;
    }
  }

  // Fallback to direct Notification instance
  new Notification(title, options);
  return true;
}
