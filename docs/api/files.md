# Files

File properties let entities store attachments, documents, images, and other binary data. Files are stored in object storage (S3-compatible) and accessed via signed, time-limited URLs.

To enable file uploads on an entity type, add a property definition with `type: file`.

## File Property Structure

A file property value has three required metadata fields:

| Field | Description |
|---|---|
| `filename` | The original name of the file (e.g. `cover.jpg`, `report.pdf`) |
| `filesize` | Size in bytes |
| `filetype` | MIME type (e.g. `image/jpeg`, `application/pdf`) |

All three must be present when creating a file property. Each file property gets its own unique storage location identified by its `_id`.

## Upload Process

File uploads use a secure two-step flow:

**Step 1 — Create the file property**

POST the file metadata to the entity. The API responds with a property object that includes an `upload` field containing a signed URL and the required headers.

```json
{
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg",
  "upload": {
    "url": "https://s3.amazonaws.com/bucket/path?signature...",
    "method": "PUT",
    "headers": {
      "ACL": "private",
      "Content-Disposition": "inline;filename=\"cover.jpg\"",
      "Content-Length": 1937,
      "Content-Type": "image/jpeg"
    }
  }
}
```

**Step 2 — Upload the file**

PUT the file content directly to the signed URL using the exact headers from the response:

```bash
curl -X PUT "SIGNED_S3_URL" \
  -H "Content-Type: image/jpeg" \
  -H "Content-Length: 1937" \
  --data-binary "@cover.jpg"
```

The signed upload URL expires after **15 minutes**. Multiple file properties can be created in one POST — each gets its own `upload` object in the response.

::: warning
If the upload URL expires before you complete the S3 PUT, delete the property and start over.
:::

## Download Process

To download a file, GET the property by ID:

```
GET /api/{db}/property/{_id}
```

The response includes a time-limited signed URL in the `url` field — valid for 60 seconds. Do not cache or share it; generate a fresh one each time.

To trigger a direct browser download, append `?download=true` — this redirects immediately to the signed URL.
