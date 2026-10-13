import { Router, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import { supabase } from "../services/supabase.service.js";

export const uploadRouter = Router();

const BUCKET = "ppt-uploads";
const MAX_FILE_SIZE_MB = 20;
const ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const ALLOWED_EXTS = [".pdf", ".ppt", ".pptx"];

// Store file in memory (no disk write needed — we stream straight to Supabase)
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
 * POST /api/upload/ppt
 * Accepts a single file (field name: "ppt"), uploads it to Supabase Storage,
 * and returns the public URL.
 */
uploadRouter.post(
  "/ppt",
  upload.single("ppt"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const ext = path.extname(file.originalname).toLowerCase();
      const timestamp = Date.now();
      const safeName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_{2,}/g, "_");
      const storagePath = `submissions/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError && (uploadError.message?.toLowerCase().includes("not found") || (uploadError as any).statusCode === "404" || (uploadError as any).status === 404)) {
        console.log(`[Upload] Bucket '${BUCKET}' not found. Attempting creation...`);
        const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE_MB * 1024 * 1024,
        });
        if (!createErr) {
          const retry = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });
          uploadError = retry.error;
        }
      }

      if (uploadError) {
        console.error("[Upload] Supabase storage error:", uploadError.message);
        res.status(500).json({
          error: "Failed to upload file to storage. Please ensure Supabase storage bucket 'ppt-uploads' is configured.",
          detail: uploadError.message,
        });
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      res.json({
        success: true,
        url: urlData.publicUrl,
        fileName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
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
