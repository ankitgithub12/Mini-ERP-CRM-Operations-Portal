const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const { accessKeyId, secretAccessKey, region, bucketName } = env.aws;

let s3Client = null;
const isS3Configured = accessKeyId && secretAccessKey && region && bucketName;

if (isS3Configured) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Uploads a file to AWS S3 or returns a mock URL if S3 is not configured.
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Public S3 URL of the uploaded image
 */
const uploadFile = async (file) => {
  if (!file) {
    throw new AppError('No file provided for upload', 400);
  }

  // Fallback to mock image if S3 credentials are missing
  if (!isS3Configured) {
    console.warn('[WARN] AWS S3 is not configured. Returning mock image URL.');
    // List of clean mock product images based on categories
    const mockImages = [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80', // Watch
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80', // Headphones
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80', // Sunglasses
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80', // Shoes
    ];
    // Return a random mock image
    const randomIndex = Math.floor(Math.random() * mockImages.length);
    return mockImages[randomIndex];
  }

  const fileExtension = file.originalname.split('.').pop();
  const cleanFileName = file.originalname
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const s3Key = `products/${Date.now()}_${cleanFileName}.${fileExtension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Construct the public URL of the uploaded object
    return `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
  } catch (err) {
    console.error('AWS S3 Upload Error:', err);
    throw new AppError(`Failed to upload image to S3: ${err.message}`, 500);
  }
};

module.exports = {
  uploadFile,
  isS3Configured,
};
