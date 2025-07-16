import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // data is expected to be an array of { recipient, body }
    if (!Array.isArray(data) || data.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid request body" }), { status: 400 });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    // Send emails one by one
    for (const item of data) {
      if (!item.recipient || !item.body) continue;

      await transporter.sendMail({
        from: `"Tyres Company" <${process.env.SMTP_FROM_EMAIL}>`,
        to: item.recipient,
        subject: "Tyres Company - Partnership Proposal",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f44336; padding: 20px; color: white; text-align: center;">
              <h1>Tyres Company</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd;">
              ${item.body}
              <p style="margin-top: 30px;">Best regards,</p>
              <p><strong>The Tyres Company Team</strong></p>
            </div>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #777;">
              © ${new Date().getFullYear()} Tyres Company. All rights reserved.
            </div>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ message: "Emails sent successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ message: "Failed to send emails", error: String(error) }),
      { status: 500 },
    );
  }
}
