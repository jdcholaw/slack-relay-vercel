export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  const eventType = body?.type || '';
  const metadata = body?.data?.metadata || {};

  let slackMessage;

  if (eventType === 'runtime.call.start') {
    // 📞 통화 시작 알림
    slackMessage = {
      text: `📞 *JDCHO 새 통화 시작됨!*\n- 발신자: ${metadata.userNumber || '(정보 없음)'}\n- 시작 시각: ${new Date().toLocaleString()}`
    };
  } else if (eventType === 'runtime.call.end') {
    // 📴 통화 종료 알림
    slackMessage = {
      text: `📞 JDCHO 통화 종료 알림\n- 발신자: ${metadata.userNumber || '(정보 없음)'}\n- 종료 사유: ${body?.data?.endReason || '(없음)'}\n- 종료 시각: ${new Date().toLocaleString()}\n\n🔍 DEBUG metadata: ${JSON.stringify(metadata, null, 2)}`
  } else {
    // 🔘 예외 상황 무시
    return res.status(200).json({ ignored: true });
  }

  try {
    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage)
    });

    console.log('Slack status:', slackRes.status);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Slack send error:', error);
    return res.status(500).json({ error: 'Slack send failed' });
  }
}
