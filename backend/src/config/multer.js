import multer from "multer";
import path from "path";
import fs from "fs";

const allowedMimeTypes = [
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint"
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve("uploads", "files");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, ZIP, DOC, DOCX, PPT allowed."));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter
});