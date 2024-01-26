import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import fetch, { Response } from 'node-fetch';

const LOGGING_BUCKET_NAME = 'pihealth-doorbuttonpresser-logs';

export async function main() {
  // A region and credentials can be declared explicitly. For example
  // `new S3Client({ region: 'us-east-1', credentials: {...} })` would
  //initialize the client with those settings. However, the SDK will
  // use your local configuration and credentials if those properties
  // are not defined here.
  const s3Client = new S3Client({
    region: 'us-east-1',
    // Use default local credentails
  });

  // Get local dynamic RPI-Monitor data
  const response: Response = await fetch('http://192.168.1.172:8888/dynamic.json')
  const responseText: string = await response.text();

  const objectName: string = `${Date.now()}-dynamic-metrics.json`;


  // Put an object into an Amazon S3 bucket.
  await s3Client.send(
    new PutObjectCommand({
      Bucket: LOGGING_BUCKET_NAME,
      Key: objectName,
      Body: responseText,
    })
  );

  // Read the object.
  const body = await s3Client.send(
    new GetObjectCommand({
      Bucket: LOGGING_BUCKET_NAME,
      Key: objectName,
    })
  );
  console.log(await body.Body?.transformToString());
}

// Call a function if this file was run directly. This allows the file
// to be runnable without running on import.
import {fileURLToPath} from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
