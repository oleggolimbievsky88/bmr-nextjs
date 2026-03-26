import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return null;
  }

  return {
    endpoint,
    bucketName,
    credentials: { accessKeyId, secretAccessKey },
  };
}

export function getR2Client() {
  const cfg = getR2Config();
  if (!cfg) return null;
  return {
    client: new S3Client({
      region: "auto",
      endpoint: cfg.endpoint,
      credentials: cfg.credentials,
    }),
    bucketName: cfg.bucketName,
  };
}

export async function r2List({ bucketName, client, prefix, delimiter }) {
  const cmd = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: delimiter || "/",
  });
  return client.send(cmd);
}

export async function r2SignedDownloadUrl({
  bucketName,
  client,
  key,
  expiresInSeconds,
}) {
  const cmd = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds || 60 });
}
