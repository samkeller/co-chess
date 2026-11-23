import type { Bot, BotMeta } from './bot.ts';

/** Une classe de Bot concrète, c'est-à-dire un Algorithme. */
export interface BotClass<Config extends object = any> {
  new (config?: Partial<Config>): Bot<Config>;
  meta: BotMeta<Config>;
}

/** Un Préréglage : un Algorithme, un nom affiché et une configuration. De la donnée pure. */
export interface Preset<Config extends object = Record<string, unknown>> {
  algorithm: string;
  name: string;
  config: Partial<Config>;
}

/** Les Algorithmes disponibles et les Préréglages proposés aux joueurs. */
export class BotRegistry {
  private readonly algorithms = new Map<string, BotClass>();
  readonly presets: readonly Preset[];

  constructor(algorithms: readonly BotClass[], presets: readonly Preset[]) {
    for (const algorithm of algorithms) {
      const { id } = algorithm.meta;
      if (this.algorithms.has(id)) throw new Error(`L'Algorithme « ${id} » est déjà enregistré.`);
      this.algorithms.set(id, algorithm);
    }
    for (const preset of presets) this.get(preset.algorithm);
    this.presets = presets;
  }

  /** Crée un Bot à partir d'un Préréglage, ou d'un Algorithme et d'une configuration. */
  create(preset: Preset): Bot<object>;
  create(algorithm: string, config?: object): Bot<object>;
  create(target: string | Preset, config: object = {}): Bot<object> {
    if (typeof target !== 'string') return this.create(target.algorithm, target.config);
    const Algorithm = this.get(target);
    return new Algorithm(config);
  }

  private get(id: string): BotClass {
    const algorithm = this.algorithms.get(id);
    if (!algorithm) throw new Error(`Algorithme inconnu : « ${id} ».`);
    return algorithm;
  }
}
