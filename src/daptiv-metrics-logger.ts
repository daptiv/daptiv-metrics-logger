import { StatsD } from 'node-dogstatsd';

export interface DaptivMetricsLoggerOpts {
    host: string;
    port?: number;
    socket?: string;
    prefix?: string;
    globalTags?: string[];
    statsd?: StatsD;
}

export class DaptivMetricsLogger {
    private client: StatsD;
    private prefix: string;

    constructor(options: DaptivMetricsLoggerOpts) {
        this.prefix = this.standardizeKey(options.prefix);
        // TODO: Remove this constructor, create a factory
        this.client = options.statsd || new StatsD(options.host, options.port, options.socket, { global_tags: options.globalTags });
    }

    // TODO: Get sample rates from configuration.
    timing(statName: string, msDuration: number, sample_rate?: number, tags?: string[]): void {
      this.client.timing(this.decorateStatName(statName), msDuration, sample_rate, tags);
    }

    increment(statName: string, sample_rate?: number, tags?: string[]): void {
      this.client.increment(this.decorateStatName(statName), sample_rate, tags);
    }

    incrementBy(statName: string, value: number, tags?: string[]): void {
      this.client.incrementBy(this.decorateStatName(statName), value, tags);
    }

    decrement(statName: string, sample_rate?: number, tags?: string[]): void {
      // TODO: Expected sample rate always between 0 and 1
      this.client.decrement(this.decorateStatName(statName), sample_rate, tags);
    }

    decrementBy(statName: string, value: number, tags?: string[]): void {
      // TODO: Are negative, positive, or both expected?
      this.client.decrementBy(this.decorateStatName(statName), value, tags);
    }

    gauge(statName: string, value: number, sample_rate?: number, tags?: string[]): void {
      this.client.gauge(this.decorateStatName(statName), value, sample_rate, tags);
    }

    close(): void {
      this.client.close();
    }

    private decorateStatName(key: string): string {
        return !this.prefix
            ? key
            : `${this.prefix}.${key}`;
    }

    private standardizeKey(prefix: string): string {
        if (!prefix) {
            return null;
        }
        return prefix.toLowerCase().replace(/[^a-z0-9\.]/g, '_');
    }
}
