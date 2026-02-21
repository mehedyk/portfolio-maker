/**
 * ============================================================================
 * CV DOWNLOAD UTILITY
 * Generates professional PDF from portfolio content
 * ============================================================================
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate and download CV as PDF
 * @param {Object} portfolio - Portfolio data
 * @param {Object} content - Portfolio content
 * @param {Object} images - Portfolio images
 * @param {Object} specialty_info - Doctor/Teacher specialty info
 */
export const downloadCV = async (portfolio, content, images, specialty_info) => {
    try {
        // Show loading indicator
        const loadingEl = document.createElement('div');
        loadingEl.id = 'cv-loading';
        loadingEl.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-family: Arial, sans-serif;
                flex-direction: column;
                gap: 16px;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
                <p style="font-size: 16px; margin: 0;">Generating your CV...</p>
            </div>
        `;
        document.body.appendChild(loadingEl);

        // Create temporary CV content
        const cvContent = createCVContent(portfolio, content, images, specialty_info);
        document.body.appendChild(cvContent);

        // Wait for images to load
        await waitForImages(cvContent);

        // Generate PDF
        const canvas = await html2canvas(cvContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            windowHeight: cvContent.scrollHeight
        });

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Download PDF
        const filename = `${portfolio?.username || 'portfolio'}-CV.pdf`;
        pdf.save(filename);

        // Cleanup
        document.body.removeChild(cvContent);
        document.body.removeChild(loadingEl);

    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Error generating CV:', error);
        // Show user-friendly error via DOM (no alert)
        const errBanner = document.createElement('div');
        errBanner.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#ef4444;color:white;padding:14px 20px;border-radius:10px;font-family:sans-serif;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,0.2)';
        errBanner.textContent = 'Failed to generate CV. Please try again.';
        document.body.appendChild(errBanner);
        setTimeout(() => { if (errBanner.parentNode) errBanner.parentNode.removeChild(errBanner); }, 4000);

        // Cleanup on error
        const loading = document.getElementById('cv-loading');
        const cvTemp = document.getElementById('cv-temp-content');
        if (loading) document.body.removeChild(loading);
        if (cvTemp) document.body.removeChild(cvTemp);
    }
};

/**
 * Create CV content for PDF generation
 */
const createCVContent = (portfolio, content, images, specialty_info) => {
    const div = document.createElement('div');
    div.id = 'cv-temp-content';
    div.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 1200px;
        background: white;
        padding: 60px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        color: #000000;
    `;

    const fullName = portfolio?.user_profiles?.full_name || 'Name';
    const profession = portfolio?.professions?.name || 'Professional';

    div.innerHTML = `
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000000; padding-bottom: 30px;">
            ${images?.profile ? `
                <img 
                    src="${images.profile}" 
                    style="
                        width: 120px;
                        height: 120px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 3px solid #000000;
                        margin-bottom: 20px;
                    "
                    crossorigin="anonymous"
                />
            ` : ''}
            <h1 style="font-size: 36px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.02em;">
                ${fullName}
            </h1>
            <p style="font-size: 18px; color: #666666; margin: 0 0 16px 0;">
                ${profession}
            </p>
            ${specialty_info?.doctor_type ? `
                <p style="font-size: 14px; color: #666666; margin: 0;">
                    Specialty: ${specialty_info.doctor_type}
                </p>
            ` : ''}
            ${specialty_info?.teacher_level ? `
                <p style="font-size: 14px; color: #666666; margin: 0;">
                    Teaching Level: ${specialty_info.teacher_level}
                </p>
            ` : ''}
        </div>

        <!-- Contact Information -->
        <div style="margin-bottom: 40px;">
            <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">
                CONTACT INFORMATION
            </h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                ${content?.contact?.email ? `
                    <div>
                        <strong>Email:</strong> ${content.contact.email}
                    </div>
                ` : ''}
                ${content?.contact?.phone ? `
                    <div>
                        <strong>Phone:</strong> ${content.contact.phone}
                    </div>
                ` : ''}
                ${content?.contact?.linkedin ? `
                    <div>
                        <strong>LinkedIn:</strong> ${content.contact.linkedin}
                    </div>
                ` : ''}
                ${content?.contact?.github ? `
                    <div>
                        <strong>GitHub:</strong> ${content.contact.github}
                    </div>
                ` : ''}
                ${content?.contact?.website ? `
                    <div>
                        <strong>Website:</strong> ${content.contact.website}
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- About -->
        ${content?.about ? `
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">
                    PROFESSIONAL SUMMARY
                </h2>
                <p style="font-size: 14px; line-height: 1.8; color: #333333; margin: 0;">
                    ${content.about}
                </p>
            </div>
        ` : ''}

        <!-- Skills -->
        ${content?.skills && content.skills.length > 0 ? `
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">
                    SKILLS & EXPERTISE
                </h2>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${content.skills.map(skill => `
                        <span style="
                            padding: 6px 14px;
                            border: 1px solid #E5E5E5;
                            border-radius: 16px;
                            font-size: 12px;
                            color: #333333;
                        ">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <!-- Work Experience -->
        ${content?.experience && content.experience.length > 0 ? `
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">
                    WORK EXPERIENCE
                </h2>
                ${content.experience.map(exp => `
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0;">
                                ${exp.position}
                            </h3>
                            <span style="font-size: 12px; color: #999999; text-transform: uppercase;">
                                ${exp.duration || ''}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #666666; margin: 0 0 8px 0; font-weight: 500;">
                            ${exp.company}
                        </p>
                        ${exp.description ? `
                            <p style="font-size: 13px; line-height: 1.6; color: #666666; margin: 0;">
                                ${exp.description}
                            </p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <!-- Education -->
        ${content?.education && content.education.length > 0 ? `
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">
                    EDUCATION
                </h2>
                ${content.education.map(edu => `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <h3 style="font-size: 16px; font-weight: 600; margin: 0;">
                                ${edu.degree}
                            </h3>
                            <span style="font-size: 12px; color: #999999; text-transform: uppercase;">
                                ${edu.year || ''}
                            </span>
                        </div>
                        <p style="font-size: 14px; color: #666666; margin: 0;">
                            ${edu.institution}
                        </p>
                        ${edu.description ? `
                            <p style="font-size: 13px; line-height: 1.6; color: #666666; margin: 8px 0 0 0;">
                                ${edu.description}
                            </p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <!-- Projects -->
        ${content?.projects && content.projects.length > 0 ? `
            <div style="margin-bottom: 40px;">
                <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px;">
                    FEATURED PROJECTS
                </h2>
                ${content.projects.map(project => `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
                            ${project.title}
                        </h3>
                        <p style="font-size: 13px; line-height: 1.6; color: #666666; margin: 0 0 8px 0;">
                            ${project.description}
                        </p>
                        ${project.technologies ? `
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                <strong>Technologies:</strong> ${project.technologies}
                            </p>
                        ` : ''}
                        ${project.link ? `
                            <p style="font-size: 12px; color: #0066cc; margin: 4px 0 0 0;">
                                ${project.link}
                            </p>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #000000; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">
                Generated from Portfolio Builder • ${new Date().toLocaleDateString()}
            </p>
        </div>
    `;

    return div;
};

/**
 * Wait for all images to load
 */
const waitForImages = (element) => {
    const images = element.getElementsByTagName('img');
    const promises = [];

    for (let img of images) {
        if (!img.complete) {
            promises.push(
                new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                })
            );
        }
    }

    return Promise.all(promises);
};

/**
 * Simple CV download (text-based, no images)
 * Fallback if html2canvas fails
 */
export const downloadSimpleCV = (portfolio, content, specialty_info) => {
    const fullName = portfolio?.user_profiles?.full_name || 'Name';
    const profession = portfolio?.professions?.name || 'Professional';

    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPos = 20;
    const pageWidth = 210;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Helper to add text with wrapping
    const addText = (text, fontSize, isBold = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
            pdf.setFont('helvetica', 'bold');
        } else {
            pdf.setFont('helvetica', 'normal');
        }

        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, margin, yPos);
        yPos += (fontSize / 3) * lines.length + 5;
    };

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(fullName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(profession, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Contact
    if (content?.contact) {
        addText('CONTACT INFORMATION', 12, true);
        if (content.contact.email) addText(`Email: ${content.contact.email}`, 10);
        if (content.contact.phone) addText(`Phone: ${content.contact.phone}`, 10);
        if (content.contact.linkedin) addText(`LinkedIn: ${content.contact.linkedin}`, 10);
        yPos += 5;
    }

    // About
    if (content?.about) {
        addText('PROFESSIONAL SUMMARY', 12, true);
        addText(content.about, 10);
        yPos += 5;
    }

    // Skills
    if (content?.skills && content.skills.length > 0) {
        addText('SKILLS', 12, true);
        addText(content.skills.join(', '), 10);
        yPos += 5;
    }

    // Experience
    if (content?.experience && content.experience.length > 0) {
        addText('WORK EXPERIENCE', 12, true);
        content.experience.forEach(exp => {
            addText(exp.position, 11, true);
            addText(`${exp.company} | ${exp.duration || ''}`, 10);
            if (exp.description) addText(exp.description, 9);
            yPos += 3;
        });
    }

    // Download
    const filename = `${portfolio?.username || 'portfolio'}-CV.pdf`;
    pdf.save(filename);
};

const cvUtils = { downloadCV, downloadSimpleCV };
export default cvUtils;