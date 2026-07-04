import { sendResponse } from "../utils/response.js";
import {
  createSectionService,
  getCourseSectionsService,
  updateSectionService,
  deleteSectionService
} from "../services/section.service.js";

export const createSection = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { courseId } = req.params;
    const { title, position } = req.body;

    if (!title) {
      return sendResponse(res, 400, "Section title is required");
    }

    const section = await createSectionService(teacherId, courseId, title, position);
    sendResponse(res, 201, "Section created successfully", section);
  } catch (error) {
    next(error);
  }
};

export const getCourseSections = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const sections = await getCourseSectionsService(userId, role, courseId);
    sendResponse(res, 200, "Sections fetched successfully", sections);
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { sectionId } = req.params;
    const { title, position } = req.body;

    const section = await updateSectionService(teacherId, sectionId, title, position);
    sendResponse(res, 200, "Section updated successfully", section);
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const { sectionId } = req.params;

    await deleteSectionService(teacherId, sectionId);
    sendResponse(res, 200, "Section deleted successfully");
  } catch (error) {
    next(error);
  }
};