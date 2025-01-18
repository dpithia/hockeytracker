// src/utils/emailService.js
import emailjs from "@emailjs/browser";

// Verbose initialization logging
console.log("EmailJS Initialization Attempt");
console.log("Public Key:", import.meta.env.VITE_EMAILJS_USER_ID);
console.log("Service ID:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
console.log("Template ID:", import.meta.env.VITE_EMAILJS_TEMPLATE_ID);

// Explicit initialization
try {
  // Ensure public key is provided before initialization
  const publicKey = import.meta.env.VITE_EMAILJS_USER_ID;
  if (!publicKey) {
    throw new Error("Public key is missing");
  }

  // Initialize with explicit method
  emailjs.init(publicKey);
  console.log("EmailJS initialized successfully");
} catch (initError) {
  console.error("EmailJS Initialization Error:", initError);
}

export const sendEmail = async (to, template) => {
  console.log("Attempting to send email:", { to, template });

  try {
    // Validate inputs
    if (!to) {
      console.error("No recipient email provided");
      return false;
    }

    if (!template || !template.to_name || !template.message) {
      console.error("Invalid email template", template);
      return false;
    }

    // Verify initialization parameters
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_USER_ID;

    console.log("Email Send Parameters:", {
      serviceId,
      templateId,
      publicKey,
    });

    // Throw error if any required parameter is missing
    if (!serviceId || !templateId || !publicKey) {
      throw new Error("Missing required EmailJS parameters");
    }

    // Send email with comprehensive error handling
    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: to,
        to_name: template.to_name,
        from_name: "Hockey League",
        message: template.message,
      },
      publicKey
    );

    console.log("Email send result:", result);

    // Check for successful send
    if (result && result.status === 200) {
      console.log("Email sent successfully");
      return true;
    } else {
      console.error("Email send failed", result);
      return false;
    }
  } catch (error) {
    // Comprehensive error logging
    console.error("Email Send Error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      toString: error.toString(),
      fullError: JSON.stringify(error, null, 2),
    });

    return false;
  }
};

export const emailTemplates = {
  activeRosterJoin: (playerName) => ({
    to_name: playerName,
    message: `Congratulations ${playerName}!

You've been added to the active roster for the Hockey League.

Please ensure you complete your payment to confirm your spot.

Best regards,
Hockey League Team`,
  }),
  waitlistJoin: (playerName) => ({
    to_name: playerName,
    message: `Hi ${playerName},

You have been added to the waitlist for the upcoming hockey game.

We will notify you as soon as a spot becomes available.

Best regards,
Hockey League Team`,
  }),
};
