/**
 * Forgot-password OTP email HTML template (OriBrix Admin).
 * Keep design changes here — do not inline HTML in email.service.js.
 */
export const forgotPasswordEmailSubject = "Reset your OriBrix Admin password";

export const forgotPasswordEmailHtml = ({ otp, fullName = "" }) => {
    const name = fullName?.trim() || "there";
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#041C3C 0%,#0B1220 100%);padding:28px 32px;">
              <p style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;font-weight:600;">
                OriBrix Admin
              </p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:700;">
                Password reset code
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#334155;">
                Hi ${name},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#64748b;">
                We received a request to reset your OriBrix admin password.
                Use the one-time code below to continue. This code expires in
                <strong style="color:#0f172a;">10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px;padding:22px 16px;">
                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;font-weight:700;">
                      Your OTP
                    </p>
                    <p style="margin:0;font-size:36px;letter-spacing:0.28em;font-weight:700;color:#0B1220;font-family:Consolas,Monaco,monospace;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">
                Enter this code on the <strong style="color:#0f172a;">Reset password</strong> screen,
                then choose a new password.
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#94a3b8;">
                If you did not request a password reset, you can safely ignore this email.
                Your password will stay the same.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">
                © ${year} OriBrix · Secure admin access<br />
                Do not share this code with anyone.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
};
