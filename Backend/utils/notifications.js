import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send notification email
export const sendNotificationEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending notification email:", error);
    return false;
  }
};

// New post notification
export const sendNewPostNotification = async (recipient, poster, postContent) => {
  const subject = `${poster.username} shared a new post`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border: 1px solid #333;">
      <h2 style="margin-bottom: 16px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">New Post from ${poster.username}</h2>
      <div style="margin-bottom: 24px; border-left: 2px solid rgba(255,255,255,0.3); padding-left: 16px;">
        <p style="color: rgba(255,255,255,0.7);">${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}</p>
      </div>
      <p style="margin-bottom: 24px; color: rgba(255,255,255,0.5); font-size: 14px;">Login to Habitify to view the full post and interact with it.</p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; padding: 12px 24px; background-color: #fff; color: #000; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Open Habitify</a>
      </div>
    </div>
  `;
  
  return await sendNotificationEmail(recipient.email, subject, htmlContent);
};

// New message notification
export const sendNewMessageNotification = async (recipient, sender, isGroup, groupName = null) => {
  const subject = isGroup 
    ? `New message in ${groupName}` 
    : `New message from ${sender.username}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border: 1px solid #333;">
      <h2 style="margin-bottom: 16px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">${subject}</h2>
      <p style="margin-bottom: 24px; color: rgba(255,255,255,0.7);">You have received a new message ${isGroup ? `in the group "${groupName}"` : `from ${sender.username}`}.</p>
      <p style="margin-bottom: 24px; color: rgba(255,255,255,0.5); font-size: 14px;">Login to Habitify to view and respond to your messages.</p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat${isGroup ? `/group/${groupName}` : ''}" style="display: inline-block; padding: 12px 24px; background-color: #fff; color: #000; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Open Chat</a>
      </div>
    </div>
  `;
  
  return await sendNotificationEmail(recipient.email, subject, htmlContent);
};

// Friend request notification
export const sendFriendRequestNotification = async (recipient, sender) => {
  const subject = `New friend request from ${sender.username}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border: 1px solid #333;">
      <h2 style="margin-bottom: 16px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">New Friend Request</h2>
      <p style="margin-bottom: 24px; color: rgba(255,255,255,0.7);">${sender.username} has sent you a friend request.</p>
      <p style="margin-bottom: 24px; color: rgba(255,255,255,0.5); font-size: 14px;">Login to Habitify to accept or reject this request.</p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/friends" style="display: inline-block; padding: 12px 24px; background-color: #fff; color: #000; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">Manage Friend Requests</a>
      </div>
    </div>
  `;
  
  return await sendNotificationEmail(recipient.email, subject, htmlContent);
};

// Friend request status notification
export const sendFriendRequestStatusNotification = async (recipient, responder, status) => {
  const subject = `Friend request ${status === 'accepted' ? 'accepted' : 'rejected'}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff; border: 1px solid #333;">
      <h2 style="margin-bottom: 16px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Friend Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}</h2>
      <p style="margin-bottom: 24px; color: rgba(255,255,255,0.7);">${responder.username} has ${status === 'accepted' ? 'accepted' : 'rejected'} your friend request.</p>
      ${status === 'accepted' ? `
        <p style="margin-bottom: 24px; color: rgba(255,255,255,0.7);">You can now chat with ${responder.username} and see each other's posts.</p>
      ` : ''}
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/friends" style="display: inline-block; padding: 12px 24px; background-color: #fff; color: #000; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 300;">View Friends</a>
      </div>
    </div>
  `;
  
  return await sendNotificationEmail(recipient.email, subject, htmlContent);
}; 