export const AVAILABLE_AVATARS = [
  { id: 'avatar1', url: '/avatars/avatar1.png', label: 'Eco Botanist' },
  { id: 'avatar2', url: '/avatars/avatar2.png', label: 'Audio Gamer' },
  { id: 'avatar3', url: '/avatars/avatar3.png', label: 'Sunny Joy' },
  { id: 'avatar4', url: '/avatars/avatar4.png', label: 'Cozy Coffee' },
  { id: 'avatar5', url: '/avatars/avatar5.png', label: 'Creative Artist' },
  { id: 'avatar6', url: '/avatars/avatar6.png', label: 'Star Voyager' }
];

export function getAvatarUrl(avatarIdOrUrl) {
  if (!avatarIdOrUrl) return null;
  if (avatarIdOrUrl.startsWith('/') || avatarIdOrUrl.startsWith('http')) {
    return avatarIdOrUrl;
  }
  const found = AVAILABLE_AVATARS.find((a) => a.id === avatarIdOrUrl);
  return found ? found.url : null;
}
