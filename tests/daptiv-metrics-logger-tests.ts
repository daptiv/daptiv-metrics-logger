import { DaptivMetricsLogger, DaptivMetricsLoggerOpts } from '../src/daptiv-metrics-logger';

describe('DaptivMetricsLogger', () => {
    let logger: DaptivMetricsLogger;
    let loggerOpts: DaptivMetricsLoggerOpts;
    let metricsClientSpy;

    beforeEach(() => {
        metricsClientSpy = jasmine.createSpyObj('metricsClientSpy', ['timing', 'increment', 'decrement', 'gauge', 'histogram', 'close']);
        loggerOpts = {metricsClient: metricsClientSpy};
        logger = new DaptivMetricsLogger(loggerOpts);
    });

    it('gauge should call through to metricsClient.gauge', () => {
        let statName = 'test.statname';
        let value = 29;

        logger.gauge(statName, value, 1);

        expect(metricsClientSpy.gauge).toHaveBeenCalledWith(statName, value, 1, []);
    });

    it('increment should call through to metricsClient.increment', () => {
        let statName = 'test.statname';

        logger.increment(statName, 1);

        expect(metricsClientSpy.increment).toHaveBeenCalledWith(statName, 1, 1, []);
    });

    it('timing should call through to metricsClient.timing', () => {
        let statName = 'test.statname';
        let value = 37;

        logger.timing(statName, value, .3, ['tag']);

        expect(metricsClientSpy.timing).toHaveBeenCalledWith(statName, value, .3, ['tag']);
    });

    describe('when prefix option is provided', () => {
        const prefix = 'env.prefix';
        beforeEach(() => {
          loggerOpts = {metricsClient: metricsClientSpy, prefix: prefix, globalTags: ['blu']};
          logger = new DaptivMetricsLogger(loggerOpts);
        });

        it('should lowercase prefix and replace all non-alphanumeric characters (or . ) with _', () => {
            let oddPrefix       = 'Environment.Prefix&format test';
            let formattedPrefix = 'environment.prefix_format_test';
            let statName = 'my.statname';

            loggerOpts = {metricsClient: metricsClientSpy, prefix: oddPrefix};
            logger = new DaptivMetricsLogger(loggerOpts);
            logger.increment(statName, 3);

            expect(metricsClientSpy.increment).toHaveBeenCalledWith(`${formattedPrefix}.${statName}`, 3, 1, []);
        });

        it('gauge should prefix statName with env statName', () => {
            let statName = 'test.statname';
            let value = 29;

            logger.gauge(statName, value);

            expect(metricsClientSpy.gauge).toHaveBeenCalledWith(`${prefix}.${statName}`, value, 1, ['blu']);
        });

        it('increment should prefix statName with env statName', () => {
            let statName = 'test.statname';

            logger.increment(statName);

            expect(metricsClientSpy.increment).toHaveBeenCalledWith(`${prefix}.${statName}`, 1, 1, ['blu']);
        });

        it('timing should prefix statName with env statName', () => {
            let statName = 'test.statname';
            let value = 37;

            logger.timing(statName, value);

            expect(metricsClientSpy.timing).toHaveBeenCalledWith(`${prefix}.${statName}`, value, 1, ['blu']);
        });
    });
});
