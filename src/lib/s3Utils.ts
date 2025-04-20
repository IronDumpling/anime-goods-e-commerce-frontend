import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const AWS_CONFIG = {
  accessKeyId: 'AKIAXN436UGSHN3RJ4TQ',
  secretAccessKey: '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',
  region: 'us-east-2',
  bucketName: 'product-image-ece1724'
};

// Create S3 client
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
  },
});

export async function uploadToS3(file: File): Promise<string> {
  // Generate a unique filename
  const timestamp = new Date().getTime();
  const filename = `${timestamp}_${file.name}`;

  try {
    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Create command to upload the file
    const command = new PutObjectCommand({
      Bucket: AWS_CONFIG.bucketName,
      Key: filename,
      Body: fileBuffer,
      ContentType: file.type,
      ACL: 'public-read',
    });

    // Execute the command
    await s3Client.send(command);

    // Return the URL of the uploaded file
    return `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}