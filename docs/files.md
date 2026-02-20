File properties allow entities to store attachments, documents, images, and other binary data. Unlike simple value properties, file properties combine metadata with actual file storage, using object storage for secure and scalable file hosting.

### File Property Structure

A file property requires three fields that work together:

| Field | Description |
|---|---|
| **filename** | The original name of the file (e.g., `cover.jpg`, `report.pdf`) |
| **filesize** | Size in bytes (used for validation and display) |
| **filetype** | MIME type that identifies the file format (e.g., `image/jpeg`, `application/pdf`) |

These three fields must all be present when creating a file property. Each file property gets its own unique storage location, identified by the property's `_id`.

### Upload Process

File uploads use a secure two-step process via signed URLs:

1. **Create the file property**: POST the file metadata (filename, filesize, filetype) along with the property type to create a new property on an entity. The API responds with a newly created property object that includes an `upload` object. Multiple file properties can be created in a single request - each will receive its own upload information in the response.

2. **Upload the file**: Use the signed URL from the `upload` object to PUT the actual file content directly to object storage. The URL includes pre-configured headers for access control, content disposition, and content type. When multiple files are created, upload each one individually using its corresponding signed URL.

The signed upload URL is time-limited (valid for 15 minutes) for security. During the upload, use the exact headers provided in the `upload.headers` object.

**Example property creation:**
```json
{
  "type": "photo",
  "filename": "cover.jpg",
  "filesize": 1937,
  "filetype": "image/jpeg"
}
```

**Response includes:**
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

### Download Process

To download files, make a GET request to `/api/{db}/property/{_id}`. The property response includes a time-limited (60 seconds) signed URL in the `url` field.

For direct downloads, add the `?download=true` query parameter - this redirects immediately to the signed URL, triggering the browser's download behavior.
