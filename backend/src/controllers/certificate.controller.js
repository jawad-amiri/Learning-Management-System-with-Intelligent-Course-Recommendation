import { sendResponse } from "../utils/response.js";
import {
    approveCertificateService, 
    verifyCertificateService,
    generateCertificatePdfService,
    getMyCertificatesService,
    getPendingCertificatesService
} from "../services/certificate.service.js";

export const approveCertificate = async (req, res, next) => {
    try {
        const teacherId = req.user.id;
        const { certificateId } = req.params;

        const result = await approveCertificateService(teacherId, certificateId);

        sendResponse(res, 200, "Congades, Certificate aproved successfully", result);
    } catch (error) {
        next(error);
    }
};

/**
 * varification for getting certificate
 */
export const verifyCertificate = async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await verifyCertificateService(code);

        sendResponse(res, 200, "Certificate varified successfully", result);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate certificate PDF for a course
 */
export const downloadCertificateController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    await generateCertificatePdfService(
      userId,
      courseId,
      res
    );
  } catch (error) {
    next(error);
  }
};

export const getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const certificates = await getMyCertificatesService(userId);

    sendResponse(res, 200, "Certificates fetched successfully", certificates);
  } catch (error) {
    next(error);
  }
};

export const getPendingCertificates = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const certificates = await getPendingCertificatesService(teacherId);

    sendResponse(res, 200, "Pending certificates fetched successfully", certificates);
  } catch (error) {
    next(error);
  }
};