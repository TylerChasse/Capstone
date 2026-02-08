/**
 * levels.js - Interface Level Configuration
 *
 * Defines which features are visible at each UI complexity level.
 * Each level inherits from the previous via spread, so advanced
 * includes everything from intermediate, which includes beginner.
 */

const beginner = {
  showInfoColumn: false,
  showMacAddresses: false,
  showRawHex: false,
};

const intermediate = {
  ...beginner,
  showInfoColumn: true,
  showMacAddresses: true,
};

const advanced = {
  ...intermediate,
  showRawHex: true,
};

export const levels = { beginner, intermediate, advanced };

export function getLevel(name) {
  return levels[name] || levels.beginner;
}
