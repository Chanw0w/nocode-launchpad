// Impact.com Event Notification Webhook
// Receives POST notifications when actions change status

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      service: 'impact-webhook',
      timestamp: new Date().toISOString(),
      message: 'Impact.com event notification endpoint is active',
    });
  }

  // Only accept POST for notifications
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const timestamp = new Date().toISOString();

    // Log the notification
    const notification = {
      receivedAt: timestamp,
      source: 'impact.com',
      data: payload,
    };

    // Parse common fields from impact.com payload
    const parsed = {
      actionId: payload.action_id || payload.ActionId || payload.id || null,
      campaignId: payload.campaign_id || payload.CampaignId || null,
      status: payload.status || payload.State || null,
      payout: payload.payout || payload.Payout || null,
      eventDate: payload.event_date || payload.EventDate || null,
      clearedDate: payload.cleared_date || payload.ClearedDate || null,
      actionTrackerName: payload.action_tracker_name || payload.ActionTrackerName || null,
    };

    notification.parsed = parsed;

    // Console log for Vercel logs
    console.log('Impact notification received:', JSON.stringify(notification, null, 2));

    // Return success
    return res.status(200).json({
      success: true,
      received: timestamp,
      actionId: parsed.actionId,
      status: parsed.status,
      payout: parsed.payout,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};