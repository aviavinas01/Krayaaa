const ReputationLog = require('../models/ReputationLog');
const User = require('../models/User');
const { createNotification } = require('./notificationService');

async function awardReputation({
  userUid,
  sourceType,
  sourceId,
  points,
  reason,
}) {
  // 1. Log event
  await ReputationLog.create({
    userUid,
    sourceType,
    sourceId,
    points,
    reason,
  });

  // 2. Update cached reputation
  await User.updateOne(
    { _id: userUid },
    { $inc: { reputation: points } }
  );

  await createNotification({
    userUid,
    type: 'REPUTATION_GRANTED',
    title: 'Reputation increased',
    message: `You gained ${points} reputation`,
    link: '/dashboard',
  });
}

module.exports = { awardReputation };
