const fetch = require('node-fetch');
const basicAuth = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  const eventType = body?.type || '';
  const metadata = body?.data?.metadata || {};
  let slackMessage;

  if (eventType === 'runtime.call.start') {
    slackMessage = {
      text: `📞 JDCHO 새 통화 시작됨!\n- 발신자: ${metadata.userNumber || '(정보 없음)'}\n- 시작 시각: ${new Date().toLocaleString()}`
    };
  } else if (eventType === 'runtime.call.end') {
    const callSid = metadata.callSid || metadata.CallSid || null;
    let recordingUrl = '';

    // 🎵 CallSid 있으면 Twilio API 호출
    if (callSid) {
      try {
        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings.json?CallSid=${callSid}`,
          {
            method: 'GET',
            headers: {
              Authorization: basicAuth,
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await twilioRes.json();
        if (data.recordings && data.recordings.length > 0) {
          const recordingSid = data.recordings[0].sid;
          recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recordingSid}.mp3`;
        }
      } catch (err) {
        console.error('녹음 URL 조회 실패:', err);
      }
    }

    slackMessage = {
      text: `📞 JDCHO 통화 종료 알림
- 발신자: ${metadata.userNumber || '(정보 없음)'}
- 종료 사유: ${body?.data?.endReason || '(없음)'}
- 종료 시각: ${new Date().toLocaleString()}
${recordingUrl ? `\n🎵 통화 녹음: ${recordingUrl}` : ''}`
    };
  } else {
    return res.status(200).json({ ignored: true });
  }

  try {
    const slackRes = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    console.log('Slack status:', slackRes.status);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Slack send error:', error);
    return res.status(500).json({ error: 'Slack send failed' });
  }
};
