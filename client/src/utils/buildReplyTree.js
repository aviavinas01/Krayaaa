export function buildReplyTree(flatReplies) {
  const map = {};
  const roots = [];

  flatReplies.forEach(r => {
    map[r._id] = { ...r, children: [] };
  });

  flatReplies.forEach(r => {
    if (r.parentReply) {
      map[r.parentReply]?.children.push(map[r._id]);
    } else {
      roots.push(map[r._id]);
    }
  });

  return roots;
}
