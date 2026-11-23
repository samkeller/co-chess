// Entrée du Worker qui fait tourner UN Bot pendant toute une Partie.
// Le Bot est créé une seule fois (au début de la Partie) : il garde son état d'un coup à l'autre.
import { registry } from '@co-chess/bots';
import { viewOf, type Bot } from '@co-chess/core';
import type { FromWorker, ToWorker } from './protocol.ts';

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ToWorker>) => void) | null;
  postMessage(message: FromWorker): void;
};

let bot: Bot<object> | null = null;

scope.onmessage = async ({ data }) => {
  try {
    switch (data.type) {
      case 'start':
        bot = registry.create(data.algorithm, data.config);
        await bot.onGameStart?.(viewOf(data.game), data.side);
        scope.postMessage({ type: 'ready' });
        break;
      case 'move': {
        if (!bot) throw new Error('Bot non démarré.');
        const { from, to, promotion } = await bot.nextMove(viewOf(data.game));
        scope.postMessage({
          type: 'move',
          move: promotion ? { from, to, promotion } : { from, to },
        });
        break;
      }
      case 'end':
        await bot?.onGameEnd?.(data.result);
        break;
    }
  } catch (error) {
    scope.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
