import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const { courseId, sectionId } = req.params;

    const baseDir = path.resolve("uploads");

    const dir = path.join(
      baseDir,
      "courses",
      `course_${courseId}`,
      `section_${sectionId}`,
      "videos"
    );

    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: (req, file, cb) => {

    const timestamp = Date.now();

    const safeName =
      file.originalname.replace(/\s+/g, "_");

    cb(
      null,
      `${timestamp}-${safeName}`
    );
  }

});

const upload = multer({
  storage,

  fileFilter: (req,file,cb) => {

    const allowed = [
      "video/mp4",
      "video/webm",
      "video/ogg"
    ];

    if(!allowed.includes(file.mimetype)){
      return cb(
        new Error("Invalid video format"),
        false
      );
    }

    cb(null,true);
  },

  limits:{
    fileSize: 500 * 1024 * 1024 //500MB
  }
});

export default upload;