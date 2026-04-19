const MARKERS = [
  'package.json',
  '.git',
  'README.md',
  'requirements.txt',
  'pyproject.toml',
  'Cargo.toml',
  'composer.json',
  'go.mod'
];

export function detectProjectMarkers(entryNames = []) {
  const found = MARKERS.filter((marker) => entryNames.includes(marker));
  return {
    isProjectRoot: found.length > 0,
    markers: found
  };
}
