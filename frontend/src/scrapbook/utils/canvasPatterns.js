/**
 * Generates procedural CSS background styling based on template pattern and color.
 * Supports: 'dots', 'lines', 'grid', 'plain'
 */
export function getPatternBg(pattern, color) {
  switch (pattern) {
    case 'dots':
      return {
        backgroundColor: color,
        backgroundImage: 'radial-gradient(rgba(114, 47, 55, 0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
      }
    case 'lines':
      return {
        backgroundColor: color,
        backgroundImage: 'linear-gradient(rgba(114, 47, 55, 0.1) 1px, transparent 1px)',
        backgroundSize: '100% 24px',
      }
    case 'grid':
      return {
        backgroundColor: color,
        backgroundImage:
          'linear-gradient(rgba(88, 123, 102, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 123, 102, 0.12) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }
    case 'plain':
    default:
      return { backgroundColor: color }
  }
}
