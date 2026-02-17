module.exports = (minPoints) => {
  return (req, res, next) => {
    if (!req.user || req.user.reputation < minPoints) {
      return res.status(403).json({
        msg: `You need at least ${minPoints} contribution points`,
      });
    }
    next();
  };
};
