const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Email Service
 * Handles sending emails and notifications
 */
class EmailService {
  /**
   * Initialize email service
   */
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = {};
    this.loadTemplates();
    logger.info('Email Service initialized');
  }

  /**
   * Create email transporter
   * @returns {Object} - Nodemailer transporter
   */
  createTransporter() {
    // Create transporter based on environment
    if (process.env.NODE_ENV === 'development') {
      // Use ethereal.email for development
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.EMAIL_PASSWORD || 'ethereal_pass',
        },
      });
    } else {
      // Use configured SMTP server for production
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  /**
   * Load email templates
   */
  loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/emails');
      
      // Check if directory exists
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
        this.createDefaultTemplates(templatesDir);
      }
      
      // Load all template files
      const templateFiles = fs.readdirSync(templatesDir);
      
      templateFiles.forEach(file => {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf8');
          this.templates[templateName] = handlebars.compile(templateContent);
        }
      });
      
      logger.info(`Loaded ${Object.keys(this.templates).length} email templates`);
    } catch (error) {
      logger.error(`Error loading email templates: ${error.message}`);
    }
  }

  /**
   * Create default email templates
   * @param {string} templatesDir - Templates directory
   */
  createDefaultTemplates(templatesDir) {
    try {
      // Create welcome template
      const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to AI Hashtag Optimizer</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; background-color: #4a69bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AI Hashtag Optimizer!</h1>
    </div>
    <div class="content">
      <p>Hello {{userName}},</p>
      <p>Thank you for joining AI Hashtag Optimizer! We're excited to help you optimize your social media presence with AI-powered hashtag suggestions.</p>
      <p>With our platform, you can:</p>
      <ul>
        <li>Get AI-generated hashtag suggestions tailored to your content</li>
        <li>Schedule posts across multiple social media platforms</li>
        <li>Track performance and analytics</li>
        <li>Stay on top of trending hashtags</li>
      </ul>
      <p>To get started, click the button below to access your dashboard:</p>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
      </p>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The AI Hashtag Optimizer Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} AI Hashtag Optimizer. All rights reserved.</p>
      <p>You're receiving this email because you signed up for AI Hashtag Optimizer.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      // Create password reset template
      const passwordResetTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; background-color: #4a69bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
    .code { font-family: monospace; font-size: 24px; letter-spacing: 5px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hello {{userName}},</p>
      <p>We received a request to reset your password for your AI Hashtag Optimizer account. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <p style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </p>
      <p>Or use this verification code:</p>
      <div class="code">{{resetCode}}</div>
      <p>This link and code will expire in 1 hour.</p>
      <p>If you have any issues, please contact our support team.</p>
      <p>Best regards,<br>The AI Hashtag Optimizer Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} AI Hashtag Optimizer. All rights reserved.</p>
      <p>You're receiving this email because you requested a password reset.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      // Create post published template
      const postPublishedTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Post Has Been Published</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; background-color: #4a69bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
    .post-content { background-color: #eee; padding: 15px; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Post Has Been Published!</h1>
    </div>
    <div class="content">
      <p>Hello {{userName}},</p>
      <p>Your scheduled post has been successfully published to {{platform}}.</p>
      <p><strong>Post Content:</strong></p>
      <div class="post-content">{{postContent}}</div>
      <p><strong>Scheduled Time:</strong> {{scheduledTime}}</p>
      <p><strong>Published Time:</strong> {{publishedTime}}</p>
      <p>To view your post's performance, click the button below:</p>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">View Dashboard</a>
      </p>
      <p>Thank you for using AI Hashtag Optimizer!</p>
      <p>Best regards,<br>The AI Hashtag Optimizer Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} AI Hashtag Optimizer. All rights reserved.</p>
      <p>You're receiving this email because you enabled post notifications.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      // Create post failed template
      const postFailedTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Post Publishing Failed</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #e74c3c; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; background-color: #4a69bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
    .post-content { background-color: #eee; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .error { color: #e74c3c; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Post Publishing Failed</h1>
    </div>
    <div class="content">
      <p>Hello {{userName}},</p>
      <p>We're sorry, but we were unable to publish your scheduled post to {{platform}}.</p>
      <p><strong>Post Content:</strong></p>
      <div class="post-content">{{postContent}}</div>
      <p><strong>Scheduled Time:</strong> {{scheduledTime}}</p>
      <p><strong>Error:</strong> <span class="error">{{error}}</span></p>
      <p>To reschedule your post or fix the issue, please visit your dashboard:</p>
      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
      </p>
      <p>If you need assistance, please contact our support team.</p>
      <p>Best regards,<br>The AI Hashtag Optimizer Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} AI Hashtag Optimizer. All rights reserved.</p>
      <p>You're receiving this email because you enabled post notifications.</p>
    </div>
  </div>
</body>
</html>
      `;
      
      // Write templates to files
      fs.writeFileSync(path.join(templatesDir, 'welcome.hbs'), welcomeTemplate);
      fs.writeFileSync(path.join(templatesDir, 'password-reset.hbs'), passwordResetTemplate);
      fs.writeFileSync(path.join(templatesDir, 'post-published.hbs'), postPublishedTemplate);
      fs.writeFileSync(path.join(templatesDir, 'post-failed.hbs'), postFailedTemplate);
      
      logger.info('Created default email templates');
    } catch (error) {
      logger.error(`Error creating default email templates: ${error.message}`);
    }
  }

  /**
   * Send an email
   * @param {Object} emailData - Email data
   * @returns {Promise} - Email sending result
   */
  async sendEmail(emailData) {
    try {
      const { to, subject, template, context, from, attachments } = emailData;
      
      // Add current year to context
      const fullContext = {
        ...context,
        year: new Date().getFullYear(),
      };
      
      // Get template
      const templateFn = this.templates[template];
      if (!templateFn) {
        throw new Error(`Email template '${template}' not found`);
      }
      
      // Render HTML
      const html = templateFn(fullContext);
      
      // Send email
      const mailOptions = {
        from: from || `"AI Hashtag Optimizer" <${process.env.EMAIL_FROM || 'noreply@aihashtag.com'}>`,
        to,
        subject,
        html,
        attachments,
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent to ${to}: ${subject}`);
      
      // For development, log preview URL
      if (process.env.NODE_ENV === 'development' && result.messageId) {
        logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object
   * @returns {Promise} - Email sending result
   */
  async sendWelcomeEmail(user) {
    try {
      const emailData = {
        to: user.email,
        subject: 'Welcome to AI Hashtag Optimizer!',
        template: 'welcome',
        context: {
          userName: user.name,
          dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
        },
      };
      
      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error(`Error sending welcome email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Reset token
   * @param {string} resetCode - Reset code
   * @returns {Promise} - Email sending result
   */
  async sendPasswordResetEmail(user, resetToken, resetCode) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      
      const emailData = {
        to: user.email,
        subject: 'Reset Your Password - AI Hashtag Optimizer',
        template: 'password-reset',
        context: {
          userName: user.name,
          resetUrl,
          resetCode,
        },
      };
      
      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error(`Error sending password reset email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService(); 