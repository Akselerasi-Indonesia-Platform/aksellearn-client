# DigitalOcean Spaces CORS Configuration

**To:** DevOps / Infrastructure Admin  
**From:** Backend Team  
**Subject:** Required CORS update for Direct-to-S3 Uploads  

To bypass the Cloudflare 100MB proxy limit, we are implementing "Presigned URLs". This means the users' browsers will upload large video files directly to the DigitalOcean Spaces bucket, completely bypassing our servers.

Because the upload originates from the browser on our domains (`admin.madacoda.dev`, `localhost:2000`) and goes directly to the DO Spaces domain (`sgp1.digitaloceanspaces.com`), **browsers will block the upload unless CORS is explicitly enabled on the bucket.**

Please apply the following CORS configuration to the `aksellearn` Spaces bucket.

### How to apply via DigitalOcean Dashboard:
1. Log in to the DigitalOcean Control Panel.
2. Go to **Spaces** and select the `aksellearn` bucket.
3. Click the **Settings** tab.
4. Scroll down to **CORS Configurations** and click **Add**.
5. Fill out the form with these exact values:

- **Origin:** 
  - `https://admin.madacoda.dev`
  - `http://localhost:2000`
  - `https://clara.madacoda.dev`
- **Allowed Methods:** 
  - `PUT`
  - `GET`
  - `OPTIONS`
- **Allowed Headers:** 
  - `*` (or specifically `Content-Type`, `Authorization`)
- **Access Control Max Age:** 
  - `3000` (or `86400`)

### How to apply via AWS CLI (Alternative):
If you manage the infrastructure via CLI, you can apply this JSON:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://admin.madacoda.dev",
        "http://localhost:2000",
        "https://clara.madacoda.dev"
      ],
      "AllowedMethods": ["PUT", "GET", "OPTIONS"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Command:
```bash
aws s3api put-bucket-cors \
  --bucket aksellearn \
  --endpoint-url https://sgp1.digitaloceanspaces.com \
  --cors-configuration file://cors.json
```

Once this is applied, the frontend will be able to upload large video files seamlessly.
