import pool from "../config/db.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export const approveCertificateService = async (teacherId, certificateId) => {
    const certQuery = `
    SELECT 
      c.user_id,
      c.course_id,
      co.teacher_id
    FROM certificates c
    JOIN courses co ON c.course_id = co.id
    WHERE c.id = $1 AND c.status = 'pending'
  `;

    const { rows } = await pool.query(certQuery, [certificateId]);

    if (rows.length === 0) {
        throw new Error("certificate not found or already processed");
    }

    if (rows[0].teacher_id !== teacherId) {
        throw new Error("Unauthorized");
    }

    const existingQuery = `
    SELECT * FROM certificates
    WHERE user_id = $1 AND course_id = $2
    AND status = 'approved'
  `;

    const { rows: existingCertificates } = await pool.query(existingQuery, [
        rows[0].user_id,
        rows[0].course_id
    ]);

    if (existingCertificates.length > 0) {
        throw new Error("Certificate already issued for this user and course");
    }
    //===================================

    const certificateCode = crypto.randomBytes(8).toString("hex");

    // Creating hashed signature
    const payload = `${rows[0].user_id}|${rows[0].course_id}|${certificateCode}`;
    const integrityHash = crypto
        .createHash("sha256")
        .update(payload)
        .digest("hex")

    const query = `
    UPDATE certificates
    SET status = 'approved',
        certificate_code = $1,
        integrity_hash = $2,
        approved_by = $3,
        issued_at = NOW()
    WHERE ID = $4`;
    try {
        await pool.query(query, [
            certificateCode, integrityHash, teacherId, certificateId
        ]);
    } catch (error) {
        if (error.code === "23505") {
            throw new Error("Certificate already issued(unique conflict)");
        }
        throw error;
    }

    return { certificate_code: certificateCode };
};

/**
 * Varification for certificate
 */
export const verifyCertificateService = async (certificateCode) => {
    const query = `
    SELECT 
        c.user_id,
        c.course_id,
        c.certificate_code,
        c.issued_at,
        c.integrity_hash,
        u.full_name,
        co.title
    FROM certificates c
    JOIN users u ON c.user_id = u.id
    JOIN courses co ON c.course_id = co.id
    WHERE c.certificate_code = $1
    AND c.status = 'approved'
    `;
    const { rows } = await pool.query(query, [certificateCode]);

    if (rows.length === 0) {
        return {
            valid: false,
            message: "Certificate not valid"
        };
    }

    const payload = `${rows[0].user_id}|${rows[0].course_id}|${certificateCode}`;
    const recalculatedHash = crypto
        .createHash("sha256")
        .update(payload)
        .digest("hex")

    if (recalculatedHash !== rows[0].integrity_hash) {
        return {
            valid: false,
            message: "Certificate integrity compromised"
        };
    }

    return {
        valid: true,
        student: rows[0].full_name,
        course: rows[0].title,
        issuedAt: rows[0].issued_at,
        certificateCode: rows[0].certificate_code
    };
};

/**
 * Generate certificate PDF for a course
 */
export const generateCertificatePdfService = async (userId, courseId, res) => {

    // 1 Get certificate + validate
    const query = `
        SELECT 
            c.certificate_code,
            c.integrity_hash,
            c.issued_at,
            u.full_name,
            co.title
        FROM certificates c
        JOIN users u ON c.user_id = u.id
        JOIN courses co ON c.course_id = co.id
        WHERE c.user_id = $1
        AND c.course_id = $2
        AND c.status = 'approved'
    `;

    const { rows } = await pool.query(query, [userId, courseId]);

    if (rows.length === 0) {
        throw new Error("Certificate not approved or not found");
    }

    const cert = rows[0];

    /**
     * ==================================================================================================
     * PDF Generation Steps:
     * ==================================================================================================
     */
    const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0
    });

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=certificate-${courseId}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    const W = doc.page.width;
    const H = doc.page.height;

    // ==========================================
    // SAFE MARGINS (consistent spacing)
    // ==========================================
    const outerMargin = 40;
    const innerMargin = 70;

    const contentLeft = innerMargin;
    const contentRight = W - innerMargin;
    const contentWidth = contentRight - contentLeft;

    // ==========================================
    // BACKGROUND
    // ==========================================
    doc.rect(0, 0, W, H).fill("#eef2f7");

    doc.rect(outerMargin, outerMargin, W - 80, H - 80)
        .fill("#ffffff");

    doc.lineWidth(3)
        .strokeColor("#0f172a")
        .rect(outerMargin, outerMargin, W - 80, H - 80)
        .stroke();

    doc.lineWidth(1.5)
        .strokeColor("#c9a227")
        .rect(innerMargin, innerMargin, W - 140, H - 140)
        .stroke();

    // ==========================================
    // HEADER STRIP (balanced height)
    // ==========================================
    const headerHeight = 65;

    doc.rect(outerMargin, outerMargin, W - 80, headerHeight)
        .fill("#0f172a");

    doc.fillColor("#ffffff")
        .fontSize(30)
        .text("BAMIKA", 0, outerMargin + 18, { align: "center" });

    doc.fontSize(11)
        .text("Advanced Digital Learning Platform", {
            align: "center"
        });

    // ==========================================
    // MAIN CENTER GRID START
    // ==========================================

    let currentY = outerMargin + headerHeight + 50;

    // Title
    doc.fillColor("#0f172a")
        .fontSize(36)
        .text("Certificate of Completion", contentLeft, currentY, {
            width: contentWidth,
            align: "center"
        });

    currentY += 55;

    // underline centered exactly
    doc.moveTo(W / 2 - 170, currentY)
        .lineTo(W / 2 + 170, currentY)
        .lineWidth(2)
        .strokeColor("#c9a227")
        .stroke();

    currentY += 30;

    // Student name
    doc.fontSize(28)
        .fillColor("#1e293b")
        .text(cert.full_name, contentLeft, currentY, {
            width: contentWidth,
            align: "center"
        });

    currentY += 50;

    // Description block
    doc.fontSize(15)
        .fillColor("#334155")
        .text(
            "has successfully fulfilled all academic and practical requirements, demonstrated comprehensive understanding of the subject matter, and completed the structured learning program with distinction.",
            contentLeft + 80,
            currentY,
            {
                width: contentWidth - 160,
                align: "center"
            }
        );

    currentY += 80;

    // Course title
    doc.fontSize(22)
        .fillColor("#0f172a")
        .text(cert.title, contentLeft, currentY, {
            width: contentWidth,
            align: "center"
        });

    // ==========================================
    // GOLD SEAL — PERFECTLY ALIGNED WITH NAME
    // ==========================================
    const sealX = contentRight - 80;
    const sealY = outerMargin + headerHeight + 120;

    doc.circle(sealX, sealY, 45)
        .fillAndStroke("#c9a227", "#a16207");

    doc.fillColor("#ffffff")
        .fontSize(12)
        .text("Certified", sealX - 28, sealY - 5);

    // ==========================================
    // FOOTER GRID (same baseline)
    // ==========================================

    const footerY = H - 120;

    const issuedDate = cert.issued_at
        ? new Date(cert.issued_at).toLocaleDateString()
        : new Date().toLocaleDateString();

    doc.fillColor("#0f172a")
        .fontSize(13)
        .text(`Issued: ${issuedDate}`, contentLeft + 10, footerY);

    doc.text(`Certificate Code: ${cert.certificate_code}`, contentLeft + 10, footerY + 20);

    // Signature block aligned right
    doc.text("Instructor Signature", contentRight - 170, footerY);

    doc.moveTo(contentRight - 170, footerY + 20)
        .lineTo(contentRight - 40, footerY + 20)
        .strokeColor("#000")
        .stroke();

    // ==========================================
    // QR — aligned with footer baseline
    // ==========================================

    const verifyUrl = `http://localhost:5000/api/certificates/verify/${cert.certificate_code}`;
    const qrImage = await QRCode.toDataURL(verifyUrl);
    const qrBase64 = qrImage.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(qrBase64, "base64");

    doc.image(qrBuffer, contentRight - 650, footerY - 290, {
        width: 80
    });

    // ==========================================
    // Integrity hash (small and centered bottom)
    // ==========================================

    doc.fontSize(7)
        .fillColor("#64748b")
        .text(
            `Integrity Hash: ${cert.integrity_hash}`,
            contentLeft,
            H - 60,
            {
                width: contentWidth,
                align: "center"
            }
        );

    doc.end();
};

export const getMyCertificatesService = async (userId) => {
    const { rows } = await pool.query(
        `SELECT
      c.id,
      c.course_id,
      c.certificate_code,
      c.status,
      c.issued_at,
      co.title AS course_title
    FROM certificates c
    JOIN courses co ON co.id = c.course_id
    WHERE c.user_id = $1
    ORDER BY c.issued_at DESC`,
        [userId]
    );

    return rows;
};

export const getPendingCertificatesService = async (teacherId) => {
    const { rows } = await pool.query(
        `SELECT
      c.id,
      c.user_id,
      c.course_id,
      c.status,
      c.issued_at,
      u.full_name AS student_name,
      u.email AS student_email,
      co.title AS course_title
    FROM certificates c
    JOIN users u ON u.id = c.user_id
    JOIN courses co ON co.id = c.course_id
    WHERE co.teacher_id = $1
    AND c.status = 'pending'
    ORDER BY c.issued_at DESC`,
        [teacherId]
    );

    return rows;
};