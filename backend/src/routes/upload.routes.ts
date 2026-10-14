import { Router, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import { supabase } from "../services/supabase.service.js";
import { authenticateAdmin } from "../middleware/auth.middleware.js";

export const uploadRouter = Router();

const BUCKET = "apex-presentations";
const MAX_FILE_SIZE_MB = 20;
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const ALLOWED_EXTS = [".pdf", ".ppt", ".pptx"];

// Store file in memory — streamed straight to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIMES.includes(file.mimetype) || ALLOWED_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, PPT, and PPTX files are allowed."));
    }
  },
});

/**
 * Ensure the private bucket exists; create it if absent.
 */
async function ensureBucket(): Promise<string | null> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false, // PRIVATE — files require signed URLs
      fileSizeLimit: MAX_FILE_SIZE_MB * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIMES,
    });
    if (error) return error.message;
  }
  return null;
}

/**
 * POST /api/upload/ppt
 * Accepts a single file (field name: "ppt"), uploads to the PRIVATE
 * Supabase Storage bucket, and returns the storage path + metadata.
 * No public URL is returned — the frontend stores the path and uses
 * signed URLs (via /api/upload/signed-url) for preview only.
 */
uploadRouter.post(
  "/ppt",
  (req, res, next) => {
    upload.single("ppt")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
          });
        }
        return res.status(400).json({
          error: err.message || "Invalid file.",
        });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      // Double-check MIME
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_MIMES.includes(file.mimetype) && !ALLOWED_EXTS.includes(ext)) {
        res.status(400).json({ error: "Only PDF, PPT, and PPTX files are allowed." });
        return;
      }

      const bucketErr = await ensureBucket();
      if (bucketErr) {
        console.error("[Upload] Bucket ensure error:", bucketErr);
        res.status(500).json({ error: "Storage bucket unavailable: " + bucketErr });
        return;
      }

      const timestamp = Date.now();
      const safeName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_{2,}/g, "_");
      const storagePath = `submissions/${timestamp}_${safeName}`;

      // Upload to Supabase Storage (private bucket)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("[Upload] Supabase storage error:", uploadError.message);
        res.status(500).json({
          error: "Failed to upload file to storage.",
          detail: uploadError.message,
        });
        return;
      }

      // Return storage path + metadata — NOT a public URL
      // The frontend stores this path; a signed URL is generated on demand.
      res.json({
        success: true,
        storagePath,
        fileName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        // Short-lived signed URL for immediate preview (1 hour)
        url: await getSignedUrl(storagePath),
      });
    } catch (err: any) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        });
        return;
      }
      console.error("[Upload] Unexpected error:", err.message);
      res.status(500).json({ error: err.message || "Upload failed." });
    }
  },
);

/**
 * GET /api/upload/signed-url?path=submissions/...
 * Returns a short-lived (1-hour) signed download URL for a private file.
 * Admin-only in production; open in development for preview.
 */
uploadRouter.get("/signed-url", async (req: Request, res: Response) => {
  const storagePath = req.query.path as string;
  if (!storagePath || typeof storagePath !== "string") {
    res.status(400).json({ error: "path query parameter is required" });
    return;
  }

  // Sanitise: must start with submissions/
  if (!storagePath.startsWith("submissions/")) {
    res.status(400).json({ error: "Invalid storage path" });
    return;
  }

  try {
    const url = await getSignedUrl(storagePath);
    if (!url) {
      res.status(500).json({ error: "Could not generate signed URL" });
      return;
    }
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/upload/ppt  (admin only)
 * Removes an orphaned file from storage.
 */
uploadRouter.delete(
  "/ppt",
  authenticateAdmin,
  async (req: Request, res: Response) => {
    const { storagePath } = req.body as { storagePath?: string };
    if (!storagePath || !storagePath.startsWith("submissions/")) {
      res.status(400).json({ error: "Invalid or missing storagePath" });
      return;
    }
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ success: true });
  },
);

// ── Helper ────────────────────────────────────────────────────────────────────

async function getSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600); // 1 hour
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
