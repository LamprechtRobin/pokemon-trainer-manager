const { getObjectFromR2 } = require('../_lib/r2');
const { handleCorsPreflight, setCorsHeaders } = require('../_lib/cors');

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

module.exports = async (req, res) => {
  try {
    const preflightResponse = handleCorsPreflight(req, res);
    if (preflightResponse) return preflightResponse;
    setCorsHeaders(req, res);

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const key = req.query.key;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Missing object key' });
    }

    const object = await getObjectFromR2(key);
    const body = await streamToBuffer(object.Body);
    const contentType = object.ContentType || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Object not found';
    return res.status(404).json({ error: message });
  }
};
