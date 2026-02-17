 module.exports = (Model, ownerField = 'ownerUid') => {
  return async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ msg: 'Item not found' });
      }

      if (item[ownerField] !== req.user.uid) {
        return res.status(403).json({ msg: 'Not authorized' });
      }

      req.item = item; // pass item forward
      next();
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  };
};
