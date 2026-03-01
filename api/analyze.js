function hexToRgb(hex) {
  const match = hex.match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) return { r: 0, g: 0, b: 0 };
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16)
  };
}

function colorToElement(hex) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const brightness = (r + g + b) / 3;

  // Black or very dark = Water
  if (brightness < 40) return 'Water';

  // White, silver, light gray = Metal
  if (brightness > 200 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return 'Metal';

  // Mid-gray = Metal
  if (Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && brightness > 100 && brightness < 200) return 'Metal';

  // Strong red channel, weak others = Fire
  if (r > 150 && r > g * 1.4 && r > b * 1.3) return 'Fire';

  // Orange-ish = Fire
  if (r > 180 && g > 80 && g < 160 && b < 80) return 'Fire';

  // Bright pink = Fire
  if (r > 180 && b > 100 && g < 100) return 'Fire';

  // Deep purple = Water
  if (b > 120 && r > 60 && r < 140 && g < 80) return 'Water';

  // Blue dominant = Water
  if (b > r && b > g && b > 80) return 'Water';

  // Green dominant = Wood
  if (g > r && g > b && g > 80) return 'Wood';

  // Yellow / tan / brown = Earth
  if (r > 130 && g > 100 && b < g * 0.8) return 'Earth';

  // Brown
  if (r > 80 && g > 50 && g < r && b < g) return 'Earth';

  // Fallback by dominant channel
  if (max === r) return 'Fire';
  if (max === g) return 'Wood';
  if (max === b) return 'Water';

  return 'Earth';
}

const DIRECTION_ELEMENTS = {
  N: 'Water',
  S: 'Fire',
  E: 'Wood',
  W: 'Metal',
  NE: 'Earth',
  NW: 'Metal',
  SE: 'Wood',
  SW: 'Earth'
};

const PRODUCTIVE = {
  Wood: 'Fire',
  Fire: 'Earth',
  Earth: 'Metal',
  Metal: 'Water',
  Water: 'Wood'
};

const DESTRUCTIVE = {
  Water: 'Fire',
  Fire: 'Metal',
  Metal: 'Wood',
  Wood: 'Earth',
  Earth: 'Water'
};

const ELEMENT_ADDITIONS = {
  Wood: 'Add green plants, wooden furniture, or vertical shapes',
  Fire: 'Add candles, warm lighting, red or orange accents, or triangular shapes',
  Earth: 'Add ceramics, stone, earthy tones, or low flat surfaces',
  Metal: 'Add metallic frames, white or gray decor, or round shapes',
  Water: 'Add a small fountain, mirrors, dark blue or black accents, or wavy shapes'
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { colors, direction } = req.body || {};

  if (!colors || !Array.isArray(colors) || !direction) {
    return res.status(400).json({ error: 'Missing colors array or direction' });
  }
  const VALID_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  if (!VALID_DIRECTIONS.includes(direction)) {
    return res.status(400).json({ error: 'Invalid direction' });
  }

  // Map each color to an element
  const colorElements = colors.map((c) => colorToElement(c));

  // Count elements
  const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  colorElements.forEach((el) => {
    counts[el]++;
  });

  // Percentages
  const total = colors.length;
  const elements = {};
  for (const [el, count] of Object.entries(counts)) {
    elements[el] = Math.round((count / total) * 100);
  }

  // Find dominant element (most frequent)
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const directionElement = DIRECTION_ELEMENTS[direction];
  const presentElements = Object.entries(counts).filter(([, c]) => c > 0).map(([el]) => el);

  // Score calculation
  let score = 50;

  // Harmony bonus
  if (dominant === directionElement) {
    score += 10;
  }

  // Diversity bonus (+5 per element present, max 25)
  score += presentElements.length * 5;

  // Productive cycle bonus
  let productiveFound = false;
  for (const el of presentElements) {
    if (presentElements.includes(PRODUCTIVE[el])) {
      productiveFound = true;
      break;
    }
  }
  if (productiveFound) score += 10;

  // Destructive cycle penalty
  let destructiveFound = false;
  let destructivePair = null;
  for (const el of presentElements) {
    if (presentElements.includes(DESTRUCTIVE[el])) {
      destructiveFound = true;
      destructivePair = [el, DESTRUCTIVE[el]];
      break;
    }
  }
  if (destructiveFound) score -= 10;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Recommendations
  const recommendations = [];
  const missingElements = Object.entries(counts)
    .filter(([, c]) => c === 0)
    .map(([el]) => el);

  if (dominant !== directionElement) {
    recommendations.push(
      `Your room faces ${direction} (${directionElement} energy). ` +
      `The dominant element is ${dominant}. ` +
      `${ELEMENT_ADDITIONS[directionElement]} to align with directional energy.`
    );
  }

  for (const el of missingElements) {
    recommendations.push(`${el} element is absent. ${ELEMENT_ADDITIONS[el]}.`);
  }

  if (destructivePair) {
    recommendations.push(
      `${destructivePair[0]} and ${destructivePair[1]} create a destructive cycle. ` +
      `Consider reducing the stronger element or adding a bridging element.`
    );
  }

  if (presentElements.length >= 4) {
    recommendations.push('Good elemental diversity. Maintain the current balance of materials and colors.');
  }

  if (recommendations.length === 0) {
    recommendations.push('This room has excellent Feng Shui balance. No major changes needed.');
  }

  // Analysis summary
  let analysis = `The room is dominated by ${dominant} energy (${elements[dominant]}%). `;
  analysis += `Facing ${direction}, this space channels ${directionElement} energy. `;

  if (dominant === directionElement) {
    analysis += 'The dominant element aligns with the directional energy, creating natural harmony.';
  } else {
    analysis += `Consider introducing more ${directionElement} elements to harmonize with the room's orientation.`;
  }

  return res.status(200).json({
    score,
    elements,
    recommendations,
    analysis
  });
}
