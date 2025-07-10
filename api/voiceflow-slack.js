export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    customer_name,
    case_type,
    phone_number,
    last_utterance,
    last_response,
    recording_url
  } = req.body;

  const text = `📞 JDCHO 통화 상세 알림
👤 이름: ${customer_name}
📂 용건: ${case_type}
📞 번호: ${phone_number}
🗣 고객 발화: ${last_utterance}
💬 AI 응답: ${last_response}
🔗 녹음 파일: ${recording_url}
🕓 시각: ${new Date().toLocaleString("ko-KR")}
`;

  const text = `📢 슬랙 하드코딩 테스트입니다. 시스템은 살아 있습니다.`;
  
  console.log('[🔍 Slack 최종 메시지]', text);
  
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Slack 전송 실패:', err.message);
    return res.status(500).json({ error: 'Slack send failed' });
  }
}
