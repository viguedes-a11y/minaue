export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { base64 } = req.body;
    const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'base64 inválido' });

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([buffer], { type: mimeType }), 'cover.jpg');

    const response = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: formData });
    const url = (await response.text()).trim();

    if (!url.startsWith('https://')) {
      return res.status(502).json({ error: 'Resposta inválida do catbox: ' + url });
    }

    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
