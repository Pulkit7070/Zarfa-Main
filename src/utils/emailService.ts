import emailjs from "@emailjs/browser";

const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface PaymentEmailData {
  employeeName: string;
  employeeEmail: string;
  amount: number;
  token: string;
  transactionHash?: string;
  companyName: string;
  paymentDate: string;
}

export const sendPaymentEmail = async (
  emailData: PaymentEmailData
): Promise<boolean> => {
  try {
    // Prepare template parameters for EmailJS
    const templateParams = {
      to_name: emailData.employeeName,
      to_email: emailData.employeeEmail,
      from_name: emailData.companyName,
      amount: emailData.amount.toLocaleString(),
      token: emailData.token,
      transaction_hash: emailData.transactionHash || "N/A",
      payment_date: emailData.paymentDate,
      company_name: emailData.companyName,
      explorer_link: emailData.transactionHash
        ? `https://explorer.aptoslabs.com/txn/${emailData.transactionHash}`
        : "N/A",
    };

    console.log("Sending email with params:", templateParams);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

export const sendBulkPaymentEmails = async (
  emailDataList: PaymentEmailData[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  // Send emails with a small delay to avoid rate limiting
  for (const emailData of emailDataList) {
    try {
      const result = await sendPaymentEmail(emailData);
      if (result) {
        success++;
      } else {
        failed++;
      }

      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(
        `Failed to send email to ${emailData.employeeEmail}:`,
        error
      );
      failed++;
    }
  }

  return { success, failed };
};
