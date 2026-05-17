export function email24h(name: string, portfolioUrl: string) {
  return {
    subject: `${name}, your portfolio is ready to go live`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0c0a08;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a08;padding:48px 24px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#100e0a;border:1px solid rgba(245,240,232,.08);border-radius:6px;padding:48px 40px;">
        <tr><td>
          <div style="font-size:24px;font-weight:700;color:#f5f0e8;margin-bottom:8px;letter-spacing:-.02em;">
            Portfolio<span style="color:#c9a96e;">AI</span>
          </div>
          <div style="width:40px;height:2px;background:#c9a96e;margin:24px 0 32px;"></div>
          <h1 style="font-size:28px;font-weight:700;color:#f5f0e8;margin:0 0 16px;letter-spacing:-.02em;line-height:1.2;">
            Hey ${name},<br>your portfolio is waiting.
          </h1>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 24px;font-weight:300;">
            You uploaded your resume yesterday and our AI built you a world-class portfolio website. But it's still locked in preview mode.
          </p>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 32px;font-weight:300;">
            For <strong style="color:#c9a96e;">just $4.99</strong> — less than a coffee — you can:
          </p>
          <ul style="font-size:15px;color:rgba(245,240,232,.7);line-height:1.9;margin:0 0 36px;padding-left:20px;">
            <li>Launch it as a public URL forever</li>
            <li>Share it with recruiters and on LinkedIn</li>
            <li>Stand out from candidates with only a resume</li>
            <li>Get hired faster</li>
          </ul>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#c9a96e;border-radius:4px;">
              <a href="${portfolioUrl}" style="display:inline-block;padding:16px 32px;color:#0c0a08;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:.02em;">
                Launch my portfolio → $4.99
              </a>
            </td></tr>
          </table>
          <p style="font-size:13px;color:rgba(245,240,232,.3);line-height:1.6;margin:0;font-weight:300;">
            One-time payment. No subscription. Yours forever.
          </p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:rgba(245,240,232,.2);margin-top:24px;letter-spacing:.05em;">
        PortfolioAI · portfolioai.company
      </p>
    </td></tr>
  </table>
</body>
</html>
    `
  }
}

export function email3d(name: string, portfolioUrl: string) {
  return {
    subject: `${name}, still on the fence?`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0c0a08;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a08;padding:48px 24px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#100e0a;border:1px solid rgba(245,240,232,.08);border-radius:6px;padding:48px 40px;">
        <tr><td>
          <div style="font-size:24px;font-weight:700;color:#f5f0e8;margin-bottom:8px;letter-spacing:-.02em;">
            Portfolio<span style="color:#c9a96e;">AI</span>
          </div>
          <div style="width:40px;height:2px;background:#c9a96e;margin:24px 0 32px;"></div>
          <h1 style="font-size:28px;font-weight:700;color:#f5f0e8;margin:0 0 16px;letter-spacing:-.02em;line-height:1.2;">
            ${name}, your competition isn't waiting.
          </h1>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 24px;font-weight:300;">
            Recruiters scroll past PDF resumes every day. They click on portfolio links.
          </p>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 32px;font-weight:300;">
            Your portfolio is ready and waiting. It costs less than your lunch to launch it.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#c9a96e;border-radius:4px;">
              <a href="${portfolioUrl}" style="display:inline-block;padding:16px 32px;color:#0c0a08;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:.02em;">
                Launch now → $4.99
              </a>
            </td></tr>
          </table>
          <p style="font-size:13px;color:rgba(245,240,232,.3);line-height:1.6;margin:0;font-weight:300;">
            Every day you wait is a day a recruiter doesn't find you.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `
  }
}

export function email7d(name: string, portfolioUrl: string) {
  return {
    subject: `Last reminder for ${name}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0c0a08;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a08;padding:48px 24px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#100e0a;border:1px solid rgba(245,240,232,.08);border-radius:6px;padding:48px 40px;">
        <tr><td>
          <div style="font-size:24px;font-weight:700;color:#f5f0e8;margin-bottom:8px;letter-spacing:-.02em;">
            Portfolio<span style="color:#c9a96e;">AI</span>
          </div>
          <div style="width:40px;height:2px;background:#c9a96e;margin:24px 0 32px;"></div>
          <h1 style="font-size:28px;font-weight:700;color:#f5f0e8;margin:0 0 16px;letter-spacing:-.02em;line-height:1.2;">
            Don't let this go to waste, ${name}.
          </h1>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 24px;font-weight:300;">
            One week ago you uploaded your resume. The AI built you a world-class portfolio. It's still sitting there, unused.
          </p>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 32px;font-weight:300;">
            <strong style="color:#c9a96e;">$4.99 to launch it.</strong> That's it. No subscription. No catch.
          </p>
          <p style="font-size:16px;color:rgba(245,240,232,.7);line-height:1.65;margin:0 0 36px;font-weight:400;font-style:italic;">
            "I got a recruiter message 8 hours after launching." — recent user
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#c9a96e;border-radius:4px;">
              <a href="${portfolioUrl}" style="display:inline-block;padding:16px 32px;color:#0c0a08;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:.02em;">
                Launch my portfolio → $4.99
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `
  }
}
