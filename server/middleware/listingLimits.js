// middleware/listingLimit.js

module.exports =
  ({ model, ownerField, type }) =>
  async (req, res, next) => {
    try {
      const reputation = req.user.reputation ?? 0;
      const userUid = req.user.uid;

      /* -----------------------------
         DEFINE LIMITS
      ----------------------------- */
      let limit;

      if (type === 'product') {
        limit = reputation >= 25 ? 3 : 2;
      }

      if (type === 'rental') {
        limit = reputation >= 25 ? 2 : 1;
      }

      if (!limit) {
        return res.status(500).json({ msg: 'Invalid listing limit config' });
      }

      /* -----------------------------
         COUNT ACTIVE LISTINGS
      ----------------------------- */
      const count = await model.countDocuments({
        [ownerField]: userUid,
        isActive: { $ne: false }, // deleted listings don't count
      });

      if (count >= limit) {
        return res.status(403).json({
          msg: `Listing limit reached. Allowed: ${limit}`,
          limit,
          current: count,
        });
      }

      next();
    } catch (err) {
      console.error('Listing limit middleware error:', err);
      res.status(500).json({ msg: 'Failed to validate listing limits' });
    }
  };
