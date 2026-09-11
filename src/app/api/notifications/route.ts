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
  const fromEmail = process.env.EMAIL_FROM || 'Hydra Hydration <reminders@hydra.app>';

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
              <h2 style="color: #38bdf8; margin-bottom: 10px;">💧 Hydra Hydration Reminder</h2>
              <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0;">${body}</p>
              <hr style="border-color: #334155; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8;">Sent with 💙 by Hydra App</p>
            </div>
          `
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error: ${errorText}`);
      }

      return { status: 'delivered', provider: 'Resend API' };
    } catch (err) {
      console.error('Failed to send email via Resend API:', err);
      return { status: 'failed', error: err instanceof Error ? err.message : 'Resend dispatch failed' };
    }
  }

  // Simulated Email Dispatch (Dev / Offline mode)
  console.log(`[Hydra Notification System] 📧 EMAIL DISPATCHED to <${toEmail}>`);
  console.log(`Subject: ${title}`);
  console.log(`Body: ${body}`);
  return { status: 'delivered', provider: 'Simulator (Dev Mode - add RESEND_API_KEY for live delivery)' };
}

async function sendSMSNotification(toPhone: string, title: string, body: string) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('From', twilioFrom);
      params.append('To', toPhone);
      params.append('Body', `${title}: ${body}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'Twilio SMS dispatch failed');
      }

      return { status: 'delivered', provider: 'Twilio SMS' };
    } catch (err) {
      console.error('Failed to send SMS via Twilio API:', err);
      return { status: 'failed', error: err instanceof Error ? err.message : 'Twilio SMS dispatch failed' };
    }
  }

  // Simulated SMS Dispatch (Dev / Offline mode)
  console.log(`[Hydra Notification System] 📱 SMS DISPATCHED to <${toPhone}>`);
  console.log(`Message: ${title} - ${body}`);
  return { status: 'delivered', provider: 'Simulator (Dev Mode - add TWILIO_* keys for live SMS)' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, channel = 'all', email, phone, subscription, payload } = body;

    const title = payload?.title || 'Hydra Hydration Check! 💧';
    const message = payload?.body || 'Time for a glass of water!';

    const results: Record<string, unknown> = {};

    // 1. Email Channel
    if ((channel === 'email' || channel === 'all') && email) {
      results.email = await sendEmailNotification(email, title, message);
    }

    // 2. Phone / SMS Channel
    if ((channel === 'phone' || channel === 'all') && phone) {
      results.phone = await sendSMSNotification(phone, title, message);
    }

    // 3. Web Push Channel
    if ((channel === 'push' || channel === 'all') && subscription) {
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
