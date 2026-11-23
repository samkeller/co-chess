import { createTheme, type MantineColorsTuple } from '@mantine/core';

/** Laiton : l'unique couleur d'accent (sélection, dernier coup, action principale). */
const brass: MantineColorsTuple = [
  '#fbf6e9',
  '#f3e8c8',
  '#e8d49b',
  '#dcbf6b',
  '#d2ae45',
  '#cba22e',
  '#c79c22',
  '#af8817',
  '#9c780f',
  '#876700',
];

/** Encre chaude : remplace le gris froid du thème sombre de Mantine. */
const ink: MantineColorsTuple = [
  '#ddd8cb',
  '#bdb7a8',
  '#948e80',
  '#6f6a5e',
  '#4d4940',
  '#3a3730',
  '#2d2a25',
  '#23211d',
  '#1b1a17',
  '#141311',
];

export const theme = createTheme({
  primaryColor: 'brass',
  primaryShade: { dark: 5, light: 7 },
  colors: { brass, dark: ink },
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace',
  headings: {
    fontFamily: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
});

/** Couleurs de l'échiquier : ivoire et vert feutre, laiton pour l'attention, rouge pour l'échec. */
export const board = {
  light: '#ece3cf',
  dark: '#7d9572',
  lastMove: 'rgba(210, 174, 69, 0.42)',
  selected: 'rgba(210, 174, 69, 0.65)',
  check:
    'radial-gradient(circle, rgba(224, 49, 49, 0.95) 0%, rgba(224, 49, 49, 0.55) 40%, transparent 72%)',
  moveDot: 'radial-gradient(circle, rgba(20, 19, 17, 0.28) 20%, transparent 22%)',
  captureRing: 'radial-gradient(circle, transparent 58%, rgba(20, 19, 17, 0.28) 60%)',
} as const;
