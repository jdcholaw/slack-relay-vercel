export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;

  const message = {
    text: `📞 Voiceflow 통화 종료 알림\n- 발신자: ${body?.data?.metadata?.userNumber || '(정보 없음)'}\n- 종료 사유: ${body?.data?.endReason || '(없음)'}`
  };

  try {
    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    console.log('Slack status:', slackRes.status);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Slack send error:', error);
    return res.status(500).json({ error: 'Slack send failed' });
  }
}
