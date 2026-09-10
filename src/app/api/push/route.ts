import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFG7Q...'; // Fallback / mock key
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '...';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    'mailto:support@hydra.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, action, payload } = body;

    if (action === 'subscribe') {
      if (!subscription || !subscription.endpoint) {
        return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
      }

      if (isSupabaseConfigured && supabase) {
        await supabase.from('push_subscriptions').upsert({
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString()
        });
      }

      return NextResponse.json({ success: true, message: 'Subscription saved successfully' });
    }

    if (action === 'send') {
      if (!subscription) {
        return NextResponse.json({ error: 'Subscription missing' }, { status: 400 });
      }

      const notificationPayload = JSON.stringify(payload || {
        title: 'Hydra Reminder 💧',
        body: 'Time to drink some water!'
      });

      if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        await webPush.sendNotification(subscription, notificationPayload);
      }

      return NextResponse.json({ success: true, message: 'Push notification dispatched' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Push notification error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
