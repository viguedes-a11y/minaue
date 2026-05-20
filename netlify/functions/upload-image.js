exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { base64 } = JSON.parse(event.body);
    const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return { statusCode: 400, body: JSON.stringify({ error: 'base64 inválido' }) };

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([buffer], { type: mimeType }), 'cover.jpg');

    const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: formData });
    const url = (await res.text()).trim();

    if (!url.startsWith('https://')) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Resposta inválida do catbox: ' + url }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
