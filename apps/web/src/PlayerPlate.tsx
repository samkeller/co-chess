import type { Side } from '@co-chess/core';
import { Badge, ColorSwatch, Group, Loader, Text } from '@mantine/core';
import { board } from './theme.ts';

/** La pastille d'un Camp, aux couleurs des cases de l'échiquier. */
export function SideSwatch({ side }: { side: Side }) {
  return <ColorSwatch color={side === 'white' ? board.light : '#1b1a17'} size={14} />;
}

interface Props {
  side: Side;
  name: string;
  /** Avantage matériel de ce Camp, en pions (affiché s'il est positif). */
  advantage: number;
  toMove: boolean;
  thinking: boolean;
}

/** Qui joue ce Camp, s'il a le trait, et son avantage matériel. */
export function PlayerPlate({ side, name, advantage, toMove, thinking }: Props) {
  return (
    <Group justify="space-between" h={32} px={4}>
      <Group gap="xs">
        <SideSwatch side={side} />
        <Text fw={toMove ? 700 : 500} c={toMove ? undefined : 'dimmed'}>
          {name}
        </Text>
        {thinking && <Loader type="dots" size="xs" aria-label="réfléchit" />}
      </Group>
      {advantage > 0 && (
        <Badge variant="light" size="lg">
          +{advantage}
        </Badge>
      )}
    </Group>
  );
}
