// Les globales disponibles dans TOUS les environnements où tournent core et bots :
// navigateur, Web Worker et Node. Ces paquets sont compilés sans `lib: DOM` ni types Node, pour
// garantir qu'ils restent headless : on ne déclare ici que le strict nécessaire.

declare function structuredClone<T>(value: T): T;

// Mêmes signatures que celles du DOM, pour que core se vérifie aussi depuis l'app web.
declare function setTimeout(handler: () => void, timeout?: number): number;
declare function clearTimeout(id: number | undefined): void;

interface AbortSignal {
  readonly aborted: boolean;
  readonly reason: unknown;
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: 'abort', listener: () => void): void;
  throwIfAborted(): void;
}

declare class AbortController {
  readonly signal: AbortSignal;
  abort(reason?: unknown): void;
}
