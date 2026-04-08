export const OVERPASS_MIRRORS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

export const OVERPASS_TIMEOUT = 15;
export const OVERPASS_RESULTS_LIMIT = 20;
export const SEARCH_RADIUS_METRES = 5000;

export const TYPE_LABELS: Record<string, string> = {
  attraction: 'Attraction',
  museum:     'Museum',
  viewpoint:  'Viewpoint',
  zoo:        'Zoo',
  park:       'Park',
  monument:   'Monument',
  gallery:    'Gallery',
  theme_park: 'Theme Park',
  historic:   'Historic Site',
};

export const TYPE_ICONS: Record<string, string> = {
  attraction: '✦',
  museum:     '🏛',
  viewpoint:  '🔭',
  zoo:        '🦁',
  park:       '🌿',
  monument:   '🗿',
  gallery:    '🖼',
  theme_park: '🎡',
  historic:   '⚔️',
  default:    '📍',
};

export const TYPE_GRADIENTS: Record<string, string> = {
  attraction: 'linear-gradient(135deg, #1a1228 0%, #2d1f4e 100%)',
  museum:     'linear-gradient(135deg, #0f1a2e 0%, #1e3a5f 100%)',
  viewpoint:  'linear-gradient(135deg, #0d1f1a 0%, #1a3d30 100%)',
  zoo:        'linear-gradient(135deg, #1a1a0d 0%, #3d3010 100%)',
  park:       'linear-gradient(135deg, #0d1a10 0%, #1a3d20 100%)',
  monument:   'linear-gradient(135deg, #1a1212 0%, #3d1a1a 100%)',
  gallery:    'linear-gradient(135deg, #1a0f1a 0%, #3d1f3d 100%)',
  theme_park: 'linear-gradient(135deg, #1a0d1a 0%, #3d1050 100%)',
  historic:   'linear-gradient(135deg, #1a1208 0%, #3d2a08 100%)',
  default:    'linear-gradient(135deg, #0f1726 0%, #1e2f4e 100%)',
};
