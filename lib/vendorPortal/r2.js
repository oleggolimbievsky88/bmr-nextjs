import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getR2Config() {
  const accountId = process.env.VENDOR_R2_ACCOUNT_ID;
  const accessKeyId = process.env.VENDOR_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.VENDOR_R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.VENDOR_R2_ENDPOINT ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  const bucketName = process.env.VENDOR_R2_BUCKET_NAME;
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

export async function r2PutObject({
  bucketName,
  client,
  key,
  body,
  contentType,
}) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
    }),
  );
}

export async function r2DeleteObject({ bucketName, client, key }) {
  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
}

export async function r2CopyObject({ bucketName, client, sourceKey, destKey }) {
  const enc = (s) =>
    encodeURIComponent(s).replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
  const copySource = `${bucketName}/${sourceKey.split("/").map(enc).join("/")}`;
  await client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: copySource,
      Key: destKey,
    }),
  );
}

export async function r2ListAllObjectKeys({ bucketName, client, prefix }) {
  const keys = [];
  let continuationToken;
  do {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const o of out.Contents || []) {
      if (o.Key) keys.push(o.Key);
    }
    continuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

export async function r2DeleteKeysBatch({ bucketName, client, keys }) {
  const chunkSize = 1000;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );
  }
}
