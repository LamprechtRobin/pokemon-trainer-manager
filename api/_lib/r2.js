const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getR2Env } = require('./env');

let client = null;

const getR2Client = () => {
  if (client) {
    return client;
  }

  const { r2AccountId, r2AccessKeyId, r2SecretAccessKey } = getR2Env();
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey
    }
  });

  return client;
};

const uploadDataUrlToR2 = async (dataUrl) => {
  const { r2BucketName } = getR2Env();
  const matches = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const extension = contentType.split('/')[1] || 'png';
  const key = `trainer-images/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );

  return {
    key,
    imageUrl: `/api/storage/object?key=${encodeURIComponent(key)}`
  };
};

const getObjectFromR2 = async (key) => {
  const { r2BucketName } = getR2Env();
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: r2BucketName,
      Key: key
    })
  );

  return response;
};

module.exports = {
  uploadDataUrlToR2,
  getObjectFromR2
};
