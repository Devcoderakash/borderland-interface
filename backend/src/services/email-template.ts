/**
 * APEX//1.0 Official Registration Confirmation Email Template
 * Responsive, email-client compatible HTML + clean Plain-Text fallback.
 * Uses official brand colors:
 * Background: #0B0B10, Cards: #15121B, Accent: #FF1744, Text: #FFFFFF, Secondary: #9CA3AF
 */

export interface EmailRegistrationData {
  playerId: string;
  teamName: string;
  leaderName: string;
  email: string;
  phone: string;
  college?: string | null;
  teamSize: number;
  members?: { full_name: string; position: number }[];
  preferredDomain?: string | null;
  pptFileName?: string | null;
  pptStoragePath?: string | null;
  pptUrl?: string | null;
  paymentStatus?: string | null;
  paymentAmount?: number | null;
  paymentId?: string | null;
  orderId?: string | null;
}

export function generateRegistrationConfirmationEmail(data: EmailRegistrationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Registration Confirmed — APEX//1.0 | ${data.playerId}`;

  // Format team members list
  const memberNames: string[] = [];
  if (data.members && data.members.length > 0) {
    data.members.forEach((m) => {
      if (m.full_name && m.full_name.trim().length > 0) {
        memberNames.push(m.full_name.trim());
      }
    });
  }

  // Format presentation status
  const hasPresentation = Boolean(data.pptStoragePath || data.pptUrl || data.pptFileName);
  const presentationStatus = hasPresentation
    ? `Submitted ${data.pptFileName ? `(${data.pptFileName})` : "for Evaluation"}`
    : "Submission Pending";

  // Format payment status
  const isPaid =
    data.paymentStatus === "paid" ||
    data.paymentStatus === "confirmed" ||
    Boolean(data.paymentId);
  const paymentDisplay = isPaid
    ? "Paid (₹199) · Razorpay Verified"
    : "Fee Cleared / Confirmed";

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${subject}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #0B0B10; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0B10; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Email Container -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0B0B10;">
    <tr>
      <td align="center" style="padding: 24px 12px 40px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #15121B; border: 1px solid #272033; border-radius: 12px; overflow: hidden;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; background: linear-gradient(180deg, #1d1427 0%, #15121B 100%); border-bottom: 1px solid #272033; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #FF1744; text-transform: uppercase;">
                      APEX<span style="color: #FFFFFF;">//</span>1.0
                    </span>
                    <div style="margin-top: 6px; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #9CA3AF; text-transform: uppercase;">
                      STUDENT HACKATHON · BHOPAL
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SUCCESS BANNER -->
          <tr>
            <td style="padding: 28px 32px 16px 32px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.12); border: 1px solid #10B981; color: #10B981; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px;">
                ● REGISTRATION SUCCESSFUL
              </div>
              <h1 style="margin: 18px 0 6px 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #FFFFFF; text-transform: uppercase;">
                YOUR JOURNEY STARTS HERE.
              </h1>
              <p style="margin: 0; font-size: 13px; color: #9CA3AF; line-height: 20px;">
                Your registration has been securely validated and recorded in the official event database.
              </p>
            </td>
          </tr>

          <!-- REGISTRATION ID CARD -->
          <tr>
            <td style="padding: 12px 32px 24px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 23, 68, 0.06); border: 1px solid rgba(255, 23, 68, 0.4); border-radius: 8px; text-align: center;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #FF1744; text-transform: uppercase;">
                      OFFICIAL REGISTRATION ID
                    </div>
                    <div style="margin-top: 6px; font-size: 32px; font-weight: 900; letter-spacing: 3px; color: #FF1744; font-family: 'Courier New', Courier, monospace;">
                      ${data.playerId}
                    </div>
                    <div style="margin-top: 4px; font-size: 11px; color: #9CA3AF;">
                      Quote this unique identifier for all official communications
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PERSONALIZED GREETING -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #FFFFFF;">
                Hey ${data.leaderName},
              </p>
              <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 22px; color: #E5E7EB;">
                Congratulations! Your team has successfully registered for <strong>APEX//1.0 — One Idea. No Limits.</strong>
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #9CA3AF;">
                Your registration details have been recorded. Get ready to showcase your idea, solve real-world problems, and compete with innovative minds.
              </p>
            </td>
          </tr>

          <!-- TEAM DETAILS SECTION -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0E0C13; border: 1px solid #272033; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #272033;">
                    <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #FF1744; text-transform: uppercase;">
                      REGISTERED TEAM DETAILS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px 16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF; width: 40%;">Registration ID:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF; font-weight: 700; font-family: monospace;">${data.playerId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Team Name:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF; font-weight: 700;">${data.teamName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Team Leader:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${data.leaderName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Registered Email:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Contact Number:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${data.phone}</td>
                      </tr>
                      ${
                        data.college && data.college.trim().length > 0
                          ? `<tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">College / Org:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${data.college.trim()}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Team Size:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${data.teamSize} Member${data.teamSize > 1 ? "s" : ""}</td>
                      </tr>
                      ${
                        memberNames.length > 0
                          ? `<tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF; vertical-align: top;">Team Members:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${memberNames.join(", ")}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        data.preferredDomain && data.preferredDomain.trim().length > 0
                          ? `<tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Preferred Domain:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #FFFFFF;">${data.preferredDomain.trim()}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Idea Presentation:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #00E5FF; font-weight: 600;">${presentationStatus}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; color: #9CA3AF;">Payment Status:</td>
                        <td style="padding: 6px 0; font-size: 12px; color: #10B981; font-weight: 700;">${paymentDisplay}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EVENT DETAILS SECTION -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0E0C13; border: 1px solid #272033; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #272033;">
                    <span style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #FFFFFF; text-transform: uppercase;">
                      EVENT SCHEDULE & FORMAT
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px 16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 5px 0; font-size: 12px; color: #9CA3AF; width: 40%;">Event:</td>
                        <td style="padding: 5px 0; font-size: 12px; color: #FFFFFF; font-weight: 600;">APEX//1.0</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 12px; color: #9CA3AF;">Format:</td>
                        <td style="padding: 5px 0; font-size: 12px; color: #FFFFFF;">Open Innovation</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 12px; color: #9CA3AF;">Round 1 Date:</td>
                        <td style="padding: 5px 0; font-size: 12px; color: #FF1744; font-weight: 700;">25 November 2026</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 12px; color: #9CA3AF;">Round 1 Type:</td>
                        <td style="padding: 5px 0; font-size: 12px; color: #FFFFFF;">Shortlisting Round</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 12px; color: #9CA3AF;">Round 2:</td>
                        <td style="padding: 5px 0; font-size: 12px; color: #FFFFFF;">Offline Grand Finale — Date To Be Announced</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; font-size: 12px; color: #9CA3AF;">Location:</td>
                        <td style="padding: 5px 0; font-size: 12px; color: #FFFFFF;">Bhopal, Madhya Pradesh</td>
                      </tr>
                    </table>
                    <div style="margin-top: 12px; padding: 10px 12px; background-color: rgba(0, 229, 255, 0.05); border-left: 2px solid #00E5FF; font-size: 11px; color: #E5E7EB; line-height: 17px;">
                      Your idea will be evaluated during the Round 1 shortlisting process. Further instructions and shortlist updates will be communicated through official channels.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- IMPORTANT NOTICE -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(255, 23, 68, 0.04); border: 1px solid rgba(255, 23, 68, 0.2); border-radius: 8px;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #FF1744; text-transform: uppercase;">
                      IMPORTANT NOTICE
                    </div>
                    <div style="margin-top: 4px; font-size: 12px; color: #D1D5DB; line-height: 18px;">
                      Please keep your Registration ID safe for future communication. This email confirms registration; it does not guarantee shortlisting or selection for the finale.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BRANDED FOOTER -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; background-color: #100D16; border-top: 1px solid #272033; text-align: center;">
              <div style="font-size: 13px; font-weight: 900; letter-spacing: 2px; color: #FF1744; text-transform: uppercase;">
                ONE IDEA. NO LIMITS.
              </div>
              <div style="margin-top: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #9CA3AF; text-transform: uppercase;">
                BUILD. SOLVE. INNOVATE. TOGETHER.
              </div>
              <div style="margin-top: 14px; font-size: 11px; color: #6B7280; line-height: 18px;">
                APEX//1.0 Organizing Team<br />
                Bhopal, Madhya Pradesh<br />
                <a href="mailto:lodhiakash286@gmail.com" style="color: #FF1744; text-decoration: none;">lodhiakash286@gmail.com</a>
              </div>
              <div style="margin-top: 16px; font-size: 10px; color: #4B5563;">
                This is an automated registration confirmation email. Please contact the organizing team for assistance.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Clean, high-readability plain-text version
  const text = `==================================================
APEX//1.0 — STUDENT HACKATHON · BHOPAL
REGISTRATION CONFIRMED
==================================================

OFFICIAL REGISTRATION ID: ${data.playerId}

Hey ${data.leaderName},

Congratulations! Your team has successfully registered for APEX//1.0 — One Idea. No Limits.

Your registration details have been recorded. Get ready to showcase your idea, solve real-world problems, and compete with innovative minds.

--------------------------------------------------
REGISTERED TEAM DETAILS
--------------------------------------------------
Registration ID : ${data.playerId}
Team Name       : ${data.teamName}
Team Leader     : ${data.leaderName}
Registered Email: ${data.email}
Contact Number  : ${data.phone}
${data.college ? `College / Org   : ${data.college}\n` : ""}Team Size       : ${data.teamSize} Member${data.teamSize > 1 ? "s" : ""}
${memberNames.length > 0 ? `Team Members    : ${memberNames.join(", ")}\n` : ""}${data.preferredDomain ? `Domain          : ${data.preferredDomain}\n` : ""}Presentation    : ${presentationStatus}
Payment Status  : ${paymentDisplay}

--------------------------------------------------
EVENT SCHEDULE & FORMAT
--------------------------------------------------
Event           : APEX//1.0
Format          : Open Innovation
Round 1 Date    : 25 November 2026
Round 1 Type    : Shortlisting Round
Round 2         : Offline Grand Finale — Date To Be Announced
Location        : Bhopal, Madhya Pradesh

Your idea will be evaluated during the Round 1 shortlisting process. Further instructions and shortlist updates will be communicated through official channels.

--------------------------------------------------
IMPORTANT NOTICE
--------------------------------------------------
Please keep your Registration ID safe for future communication. This email confirms registration; it does not guarantee shortlisting or selection for the finale.

==================================================
ONE IDEA. NO LIMITS.
BUILD. SOLVE. INNOVATE. TOGETHER.

APEX//1.0 Organizing Team
Bhopal, Madhya Pradesh
lodhiakash286@gmail.com

This is an automated registration confirmation email. Please contact the organizing team for assistance.
==================================================`;

  return { subject, html, text };
}
