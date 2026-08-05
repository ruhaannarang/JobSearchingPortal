import nodemailer from "nodemailer";

// Helper functions for Email Algorithm
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const escapeHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

let cachedTransporter = null;

export const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  // If real app password is provided (not placeholder)
  if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== "JobSearchPortal" &&
    process.env.EMAIL_PASS !== "your_app_password"
  ) {
    cachedTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return cachedTransporter;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    console.warn("Could not create Ethereal test account, using JSON transport fallback:", err.message);
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return cachedTransporter;
  }
};

// Function to reset cached transporter (useful for testing)
export const resetTransporterCache = () => {
  cachedTransporter = null;
};

// Runner for tests
async function runTests() {
  console.log("=== Testing Email Algorithm ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Test Email Format Validation
  console.log("\n--- 1. Testing Email Format Validation ---");
  assert(isValidEmail("test@example.com") === true, "Valid email format 'test@example.com'");
  assert(isValidEmail("john.doe+work@company.co.uk") === true, "Valid email format 'john.doe+work@company.co.uk'");
  assert(isValidEmail("invalid-email") === false, "Reject invalid email 'invalid-email'");
  assert(isValidEmail("missing@domain") === false, "Reject invalid email 'missing@domain'");
  assert(isValidEmail("@nodomain.com") === false, "Reject invalid email '@nodomain.com'");
  assert(isValidEmail("") === false, "Reject empty string");
  assert(isValidEmail(null) === false, "Reject null");
  assert(isValidEmail(12345) === false, "Reject number input");

  // 2. Testing HTML Escaping Functionality
  console.log("\n--- 2. Testing HTML Sanitization / Escaping ---");
  assert(escapeHtml("<script>alert('xss')</script>") === "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;", "Escape script tags");
  assert(escapeHtml("Tom & Jerry") === "Tom &amp; Jerry", "Escape ampersand");
  assert(escapeHtml('Quote "Test"') === "Quote &quot;Test&quot;", "Escape double quotes");
  assert(escapeHtml(null) === "", "Handle null cleanly");

  // 3. Testing Transporter Creation & Email Dispatch
  console.log("\n--- 3. Testing Email Transporter & Mail Generation ---");
  try {
    resetTransporterCache();
    const transporter = await getTransporter();
    assert(transporter !== null && transporter !== undefined, "Transporter successfully created");

    const safeName = escapeHtml("John Doe <Developer>");
    const safeJob = escapeHtml("Full Stack Engineer & Team Lead");
    const safeCompany = escapeHtml("Tech Corp Inc.");
    const safeNote = escapeHtml("We look forward to meeting you! <3");

    const mailOptions = {
      from: '"Job Portal" <no-reply@jobportal.com>',
      to: "applicant@example.com",
      subject: `🎉 Job Offer: ${safeJob} at ${safeCompany}`,
      html: `
        <div>
          <h1>Congratulations ${safeName}!</h1>
          <p>Role: ${safeJob} at ${safeCompany}</p>
          <p>Note: ${safeNote}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    assert(info !== null && info !== undefined, "Email sent through transporter");
    console.log("  Message ID:", info.messageId || "JSON Transport Output");
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("  Ethereal Preview URL:", previewUrl);
    }
  } catch (err) {
    assert(false, `Email send failed with error: ${err.message}`);
  }

  console.log(`\n=== Test Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runTests();
}
