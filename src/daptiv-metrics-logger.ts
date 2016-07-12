export interface MetricsClient {
  timing(stat: string, msDuration: number, sample_rate?: number, tags?: string[]): void;

  increment(statName: string, value?: number, sample_rate?: number, tags?: string[]): void;

  decrement(statName: string, value?: number, sample_rate?: number, tags?: string[]): void;

  gauge(statName: string, value: number, sample_rate?: number, tags?: string[]): void;

  histogram(statName: string, value: number, sample_rate?: number, tags?: string[]): void;

  close(): void;
}

export interface DaptivMetricsLoggerOpts {
    prefix?: string;
    globalTags?: string[];
    metricsClient: MetricsClient;
}

export class DaptivMetricsLogger {
    private metricsClient: MetricsClient;
    private prefix: string;
    private globalTags: string[];

    constructor(options: DaptivMetricsLoggerOpts) {
        this.prefix = this.cleanStatName(options.prefix);
        if (!options.metricsClient) {
          throw new Error('Metrics will not be logged. No metrics client was provided to the DaptivMetricsLogger');
        }
        this.metricsClient = options.metricsClient;
        this.globalTags = (options.globalTags || []).map(this.cleanStatName);
    }

    timing(statName: string, msDuration: number, sampleRate?: number, tags?: string[]): void {
      this.metricsClient.timing(this.decorateStatName(statName), msDuration, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    increment(statName: string, value?: number, sampleRate?: number, tags?: string[]): void {
      this.metricsClient.increment(this.decorateStatName(statName), value || 1, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    decrement(statName: string, value?: number, sampleRate?: number, tags?: string[]): void {
      this.metricsClient.decrement(this.decorateStatName(statName), value || 1, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    gauge(statName: string, value: number, sampleRate?: number, tags?: string[]): void {
      this.metricsClient.gauge(this.decorateStatName(statName), value, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    histogram(statName, value: number, sampleRate?: number, tags?: string[]): void {
      this.metricsClient.histogram(this.decorateStatName(statName), value, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    close(): void {
      this.metricsClient.close();
    }

    private mergeWithGlobalTags(tags: string[]): string[] {
      return tags
        ? this.globalTags.concat(tags.map(this.cleanStatName))
        : this.globalTags;
    }

    private decorateStatName(statName: string): string {
      let cleanStatName = this.cleanStatName(statName);
      return !this.prefix
          ? cleanStatName
          : `${this.prefix}.${cleanStatName}`;
    }

    private cleanStatName(statName: string): string {
        if (!statName) {
            return statName;
        }
        return statName.toLowerCase().replace(/[^a-z0-9\.]/g, '_');
    }
}
