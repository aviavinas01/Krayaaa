// Fixed avatar registry
export const AVATARS = [
  { id: 'a1', src: '/avatars/one.png' },
  { id: 'a2', src: '/avatars/two.png' },
  { id: 'a3', src: '/avatars/three.png' },
  { id: 'a4', src: '/avatars/four.png' },
  { id: 'a5', src: '/avatars/five.png' },
  { id: 'a6', src: '/avatars/six.png' },
  { id: 'a7', src: '/avatars/seven.png' },
  { id: 'a8', src: '/avatars/eight.png' },
  { id: 'a9', src: '/avatars/nine.png' },
  { id: 'a10', src: '/avatars/ten.png' },
  { id: 'a11', src: '/avatars/eleven.png' },
  { id: 'a12', src: '/avatars/twelve.png' },
  { id: 'a13', src: '/avatars/thirteen.png' },
  { id: 'a14', src: '/avatars/fourteen.png' },
  { id: 'a15', src: '/avatars/fifteen.png' },
  { id: 'a16', src: '/avatars/sixteen.png' },
];

export const AVATAR_MAP = Object.fromEntries(
  AVATARS.map(a => [a.id, a.src])
);
