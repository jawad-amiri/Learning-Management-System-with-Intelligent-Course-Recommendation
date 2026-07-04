import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
    approveCertificate,
    verifyCertificate,
    downloadCertificateController,
    getMyCertificates,
    getPendingCertificates
} from "../controllers/certificate.controller.js";

const router = express.Router();
/**
 * POST /api/certificate/:certificateId/approve
 * POST the appovel of certifcate
 */
router.post(
    "/:certificateId/approve",
    authMiddleware,
    roleMiddleware("teacher"),
    approveCertificate
);

/**
 * GET api/certificates/verify/:code
 * Varify for getting certificate
 */
router.get(
    "/verify/:code",
    authMiddleware,
    verifyCertificate
);

/**
 * GET /api/certificate/course/:courseId/download
 * Download certificate for a course
 */
router.get(
    '/course/:courseId/download',
    authMiddleware,
    roleMiddleware("student"),
    downloadCertificateController
);


router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyCertificates
);

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("teacher"),
  getPendingCertificates
);

export default router;