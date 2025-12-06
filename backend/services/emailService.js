const nodemailer = require("nodemailer");
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { ProposalDAO, VendorDAO, EmailLogDAO } = require("../DAO");
const aiService = require("./aiService");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendRFP = async (rfp, vendors) => {
  const results = [];

  for (const vendor of vendors) {
    try {
      const emailBody = generateRFPEmail(rfp, vendor);

      await transporter.sendMail({
        from: process.env.APP_EMAIL,
        to: vendor.email,
        subject: `RFP: ${rfp.title}`,
        html: emailBody,
        text: stripHtml(emailBody),
      });

      await EmailLogDAO.addEmailLog({
        requestforProposal: rfp._id,
        vendor: vendor._id,
        type: "sent",
        subject: `RFP: ${rfp.title}`,
        body: emailBody,
        from: process.env.APP_EMAIL,
        to: vendor.email,
        status: "success",
      });

      results.push({ vendor: vendor.name, success: true });
    } catch (error) {
      console.error(`Failed to send to ${vendor.name}:`, error);

      await EmailLogDAO.addEmailLog({
        requestforProposal: rfp._id,
        vendor: vendor._id,
        type: "sent",
        subject: `RFP: ${rfp.title}`,
        from: process.env.APP_EMAIL,
        to: vendor.email,
        status: "failed",
        error: error.message,
      });

      results.push({
        vendor: vendor.name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

const generateRFPEmail = (rfp, vendor) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #4F46E5; color: white; padding: 20px; }
        .content { padding: 20px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #4F46E5; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f4f4f4; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Request for Proposal</h1>
      </div>
      <div class="content">
        <p>Dear ${vendor.name},</p>
        <p>We invite you to submit a proposal for the following requirement:</p>
        
        <div class="section">
          <div class="label">Title:</div>
          <div>${rfp.title}</div>
        </div>

        <div class="section">
          <div class="label">Description:</div>
          <div>${rfp.description}</div>
        </div>

        <div class="section">
          <div class="label">Budget:</div>
          <div>${rfp.budget.toLocaleString()}</div>
        </div>

        <div class="section">
          <div class="label">Delivery Timeline:</div>
          <div>${rfp.deliveryTimeline}</div>
        </div>

        <div class="section">
          <div class="label">Items Required:</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Specifications</th>
              </tr>
            </thead>
            <tbody>
              ${rfp.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.specifications}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        ${
          rfp.paymentTerms
            ? `
          <div class="section">
            <div class="label">Payment Terms:</div>
            <div>${rfp.paymentTerms}</div>
          </div>
        `
            : ""
        }

        ${
          rfp.warrantyRequirements
            ? `
          <div class="section">
            <div class="label">Warranty Requirements:</div>
            <div>${rfp.warrantyRequirements}</div>
          </div>
        `
            : ""
        }

        ${
          rfp.additionalRequirements
            ? `
          <div class="section">
            <div class="label">Additional Requirements:</div>
            <div>${rfp.additionalRequirements}</div>
          </div>
        `
            : ""
        }

        <p><strong>Please reply to this email with your proposal including:</strong></p>
        <ul>
          <li>Detailed pricing breakdown</li>
          <li>Delivery timeline</li>
          <li>Payment terms</li>
          <li>Warranty information</li>
          <li>Any additional terms or conditions</li>
        </ul>

        <p>We look forward to receiving your proposal.</p>
        <p>Best regards,<br>Procurement Team</p>
      </div>
    </body>
    </html>
  `;
};

const stripHtml = (html) => {
  return html.replace(/<[^>]*>/g, "");
};

const startEmailListener = () => {
  const imap = new Imap({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: process.env.IMAP_PORT,
    tls: process.env.IMAP_TLS === "true",
    tlsOptions: { rejectUnauthorized: false },
  });

  const openInbox = (cb) => {
    imap.openBox("INBOX", false, cb);
  };

  imap.once("ready", () => {
    console.log("IMAP connection ready");
    openInbox((err, box) => {
      if (err) throw err;
      console.log("Monitoring inbox for new emails...");

      imap.on("mail", (numNewMsgs) => {
        console.log(`Received ${numNewMsgs} new message(s)`);
        fetchNewEmails(imap);
      });

      fetchNewEmails(imap);
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP error:", err);
  });

  imap.once("end", () => {
    console.log("IMAP connection ended");
  });

  imap.connect();
};

const fetchNewEmails = async (imap) => {
  try {
    const DAYS_BACK = 7;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - DAYS_BACK);

    const formatImapDate = (date) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const formattedDate = formatImapDate(sinceDate);
    console.log(
      ` Searching for UNSEEN emails since ${formattedDate} (last ${DAYS_BACK} days)...`
    );

    imap.search(["UNSEEN", ["SINCE", formattedDate]], async (err, results) => {
      if (err) {
        console.error("IMAP search error:", err);
        return;
      }

      if (!results || results.length === 0) {
        console.log("No new unread emails found in the last 7 days");
        return;
      }

      console.log(
        `Found ${results.length} unread email(s) from last ${DAYS_BACK} days`
      );

      const f = imap.fetch(results, { bodies: "" });

      f.on("message", (msg) => {
        msg.on("body", (stream) => {
          simpleParser(stream)
            .then(async (parsed) => {
              try {
                await processIncomingEmail(parsed);
              } catch (procErr) {
                console.error("Error processing parsed email:", procErr);
              }
            })
            .catch((parseErr) => {
              console.error("Email parsing error:", parseErr);
            });
        });
      });

      f.once("error", (err) => {
        console.error("Fetch error:", err);
      });

      f.once("end", () => {
        console.log("Finished processing batch of emails");
      });
    });
  } catch (error) {
    console.error("Error in fetchNewEmails:", error);
  }
};
const processIncomingEmail = async (email) => {
  try {
    console.log("Processing email from:", email.from.text);
    console.log("Email date:", email.date);

    const senderEmail = email.from.value[0].address;

    const vendor = await VendorDAO.getVendorByEmail(senderEmail);

    if (!vendor) {
      console.log("Email not from a known vendor:", senderEmail);
      return;
    }

    const sentLog = await EmailLogDAO.getLatestSentEmailToVendor(vendor._id);

    if (!sentLog || !sentLog.requestforProposal) {
      console.log("No matching RFP found for vendor:", vendor.name);
      return;
    }

    const rfp = sentLog.requestforProposal;
    console.log(`Processing proposal for RFP: ${rfp.title}`);

    const emailContent = email.text || email.html || "";

    const existingProposal = await ProposalDAO.getProposalByVendorAndRfp(
      vendor._id,
      rfp._id
    );

    if (existingProposal) {
      console.log(
        `Proposal already exists for ${vendor.name} on RFP ${rfp.title}`
      );
      return;
    }

    console.log("Parsing proposal with AI...");
    const parseResult = await aiService.parseVendorProposal(emailContent, rfp);

    if (!parseResult.success) {
      console.error("Failed to parse proposal with AI");
      return;
    }

    console.log("Creating proposal in database...");
    const proposal = await ProposalDAO.addProposal({
      requestforProposal: rfp._id,
      vendor: vendor._id,
      rawContent: emailContent,
      parsedData: parseResult.data,
      emailMetadata: {
        messageId: email.messageId,
        receivedAt: email.date,
        subject: email.subject,
        from: senderEmail,
      },
      status: "parsed",
    });

    console.log(`Proposal created with ID: ${proposal._id}`);

    console.log("Analyzing proposal with AI...");
    const analysisResult = await aiService.analyzeIndividualProposal(
      proposal,
      rfp
    );

    if (analysisResult.success) {
      await ProposalDAO.updateProposal(proposal._id, {
        aiAnalysis: analysisResult.data,
        status: "analyzed",
      });
      console.log(`Proposal analyzed. Score: ${analysisResult.data.score}/100`);
    }

    await EmailLogDAO.addEmailLog({
      requestforProposal: rfp._id,
      vendor: vendor._id,
      type: "received",
      subject: email.subject,
      body: emailContent,
      from: senderEmail,
      to: process.env.APP_EMAIL,
      messageId: email.messageId,
      status: "success",
    });

    console.log(`Successfully processed proposal from ${vendor.name}`);
  } catch (error) {
    console.error("Error processing incoming email:", error);

    try {
      await EmailLogDAO.addEmailLog({
        type: "received",
        subject: email.subject,
        body: email.text || email.html || "",
        from: email.from.value[0].address,
        to: process.env.APP_EMAIL,
        messageId: email.messageId,
        status: "failed",
        error: error.message,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }
};

module.exports = {
  sendRFP,
  generateRFPEmail,
  stripHtml,
  startEmailListener,
  fetchNewEmails,
  processIncomingEmail,
};
