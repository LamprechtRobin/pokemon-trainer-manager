const { uploadDataUrlToR2 } = require('./r2');

const TRAINERS_TABLE = 'trainers';

const normalizeTrainerPayload = async (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const next = { ...payload };
  if (typeof next.imageUrl === 'string' && next.imageUrl.startsWith('data:image/')) {
    const upload = await uploadDataUrlToR2(next.imageUrl);
    next.imageUrl = upload.imageUrl;
  }

  return next;
};

module.exports = {
  TRAINERS_TABLE,
  normalizeTrainerPayload
};
