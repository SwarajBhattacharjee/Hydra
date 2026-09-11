import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webPush.setVapidDetails(
      'mailto:support@hydra.app',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn('VAPID setup warning:', err);
  }
}

async function sendEmailNotification(toEmail: string, title: string, body: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  // Resend free tier requires 'onboarding@resend.dev' or a verified domain!
  const fromEmail = process.env.EMAIL_FROM || 'Hydra Hydration <onboarding@resend.dev>';

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail.trim()],
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px; max-w: 600px;">
              <h2 style="color: #38bdf8; margin-top: 0; margin-bottom: 12px; font-size: 22px;">💧 Hydra Hydration Reminder</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0; margin-bottom: 20px;">${body}</p>
              <div style="background-color: #1e293b; padding: 14px 18px; border-radius: 10px; border: 1px solid #334155;">
                <p style="font-size: 13px; color: #94a3b8; margin: 0;">Stay healthy and keep hydrated throughout your day!</p>
              </div>
              <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0 16px 0;" />
              <p style="font-size: 11px; color: #64748b; margin: 0;">Sent with 💙 by Hydra App</p>
            </div>
          `
        })
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = resData.message || resData.name || response.statusText || 'Resend error';
        console.error('[Resend Error Response]:', resData);
        return { status: 'failed', error: `Resend API Error (${response.status}): ${errorMsg}` };
      }

      return { status: 'delivered', provider: 'Resend API', id: resData.id };
    } catch (err) {
      console.error('Failed to send email via Resend API:', err);
      return { status: 'failed', error: err instanceof Error ? err.message : 'Resend dispatch failed' };
    }
  }

  // Simulated Email Dispatch (Dev / Offline mode)
  console.log(`[Hydra Notification System] 📧 EMAIL DISPATCHED (Dev Mode) to <${toEmail}>`);
  return { status: 'delivered', provider: 'Simulator (Dev Mode - add RESEND_API_KEY for live delivery)' };
}

async function sendSMSNotification(toPhone: string, title: string, body: string) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid.trim()}:${twilioToken.trim()}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', twilioFrom.trim());
      params.append('To', toPhone.trim());
      params.append('Body', `${title}: ${body}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { status: 'failed', error: resData.message || 'Twilio SMS failed' };
      }

      return { status: 'delivered', provider: 'Twilio SMS', sid: resData.sid };
    } catch (err) {
      console.error('Failed to send SMS via Twilio API:', err);
      return { status: 'failed', error: err instanceof Error ? err.message : 'Twilio SMS dispatch failed' };
    }
  }

  // Simulated SMS Dispatch (Dev / Offline mode)
  console.log(`[Hydra Notification System] 📱 SMS DISPATCHED (Dev Mode) to <${toPhone}>`);
  return { status: 'delivered', provider: 'Simulator (Dev Mode - add TWILIO_* keys for live SMS)' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, channel = 'all', email, phone, subscription, payload } = body;

    const title = payload?.title || 'Hydra Hydration Check! 💧';
    const message = payload?.body || 'Time for a glass of water!';

    const results: Record<string, { status: string; provider?: string; error?: string }> = {};

    // 1. Email Channel
    if ((channel === 'email' || channel === 'all' || action === 'test') && email) {
      results.email = await sendEmailNotification(email, title, message);
    }

    // 2. Phone / SMS Channel
    if ((channel === 'phone' || channel === 'all' || action === 'test') && phone) {
      results.phone = await sendSMSNotification(phone, title, message);
    }

    // 3. Web Push Channel
    if ((channel === 'push' || channel === 'all' || action === 'test') && subscription) {
      if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        try {
          await webPush.sendNotification(subscription, JSON.stringify({ title, body: message }));
          results.push = { status: 'delivered', provider: 'Web Push (VAPID)' };
        } catch (pushErr: unknown) {
          results.push = { status: 'failed', error: pushErr instanceof Error ? pushErr.message : 'Web Push error' };
        }
      } else {
        results.push = { status: 'delivered', provider: 'Simulator (Web Push fallback)' };
      }
    }

    // Save dispatch record to Supabase if available
    if (isSupabaseConfigured && supabase) {
      supabase.from('notification_logs').insert({
        channel,
        email: email || null,
        phone: phone || null,
        title,
        body: message,
        dispatched_at: new Date().toISOString()
      }).then();
    }

    return NextResponse.json({
      success: true,
      action: action || 'send',
      channelsDispatched: Object.keys(results),
      results
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Notification dispatch error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
