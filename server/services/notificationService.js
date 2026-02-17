const Notification = require('../models/Notification');

async function createNotification({
  userUid,
  type,
  title,
  message,
  link,
}) {
  if (!userUid) return;

  await Notification.create({
    userUid,
    type,
    title,
    message,
    link,
  });
}

module.exports = { createNotification };
