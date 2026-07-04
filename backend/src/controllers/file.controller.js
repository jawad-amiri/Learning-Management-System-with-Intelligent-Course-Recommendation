import path from "path";
import { sendResponse } from "../utils/response.js";
import {
  uploadCourseFileService,
  downloadCourseFileService,
  getCourseFilesService,
  deleteCourseFileService
} from "../services/file.service.js";

export const uploadCourseFile = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId, sectionId } = req.params;
    const upload = req.file;

    if (!upload) {
      return sendResponse(res, 400, "No file uploaded");
    }

    const file = await uploadCourseFileService(teacherId, courseId, sectionId, upload);
    sendResponse(res, 201, "File uploaded successfully", file);
  } catch (error) {
    next(error);
  }
};

export const getCourseFiles = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const files = await getCourseFilesService(userId, role, courseId);
    sendResponse(res, 200, "Files fetched successfully", files);
  } catch (error) {
    next(error);
  }
};

export const downloadCourseFile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { fileId } = req.params;

    const file = await downloadCourseFileService(userId, role, fileId);

    res.download(path.resolve(file.file_url), file.file_name);
  } catch (error) {
    next(error);
  }
};

// NEW FEATURE: delete a teacher-owned course resource.
export const deleteCourseFile = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { fileId } = req.params;

    await deleteCourseFileService(teacherId, fileId);
    sendResponse(res, 200, "File deleted successfully");
  } catch (error) {
    next(error);
  }
};
