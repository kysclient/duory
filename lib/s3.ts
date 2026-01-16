import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

/**
 * S3에 파일을 업로드하고 presigned URL을 반환합니다.
 */
export async function uploadToS3(
  file: File,
  folder: 'avatars' | 'memories'
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  
  // duory-images 베이스 폴더 안에 적절한 경로 설정
  let folderPath = '';
  if (folder === 'avatars') {
    folderPath = 'duory-images/avatars/profile-images';
  } else if (folder === 'memories') {
    folderPath = 'duory-images/memories';
  }
  
  const fileName = `${folderPath}/${timestamp}-${randomString}.${fileExtension}`;

  const buffer = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(buffer),
    ContentType: file.type,
  });

  await s3Client.send(command);

  // 공개 URL 반환 (버킷이 public일 경우)
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

/**
 * presigned URL 생성 (private 버킷용)
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * 여러 파일을 한 번에 업로드
 */
export async function uploadMultipleToS3(
  files: File[],
  folder: 'avatars' | 'memories'
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadToS3(file, folder)));
}

