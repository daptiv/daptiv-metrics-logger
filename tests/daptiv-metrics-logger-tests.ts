import { DaptivMetricsLogger, DaptivMetricsLoggerOpts } from '../src/daptiv-metrics-logger';

describe('DaptivMetricsLogger', () => {
    let logger: DaptivMetricsLogger;
    let loggerOpts: DaptivMetricsLoggerOpts;
    let loggerSpy;

    beforeEach(() => {
        loggerSpy = jasmine.createSpyObj('loggerSpy', ['timing', 'increment', 'gauge']);
        loggerOpts = {host: 'test.test.com', statsd: loggerSpy};
        logger = new DaptivMetricsLogger(loggerOpts);
    });

    it('gauge should call through to statsd-client.gauge', () => {
        let key = 'test.key';
        let value = 29;

        logger.gauge(key, value);

        expect(loggerSpy.gauge).toHaveBeenCalledWith(key, value, undefined, undefined);
    });

    it('increment should call through to statsd-client.increment', () => {
        let key = 'test.key';

        logger.increment(key);

        expect(loggerSpy.increment).toHaveBeenCalledWith(key, undefined, undefined);
    });

    it('timing should call through to statsd-client.timing', () => {
        let key = 'test.key';
        let value = 37;

        logger.timing(key, value, undefined, undefined);

        expect(loggerSpy.timing).toHaveBeenCalledWith(key, value, undefined, undefined);
    });

    describe('when prefix option is provided', () => {
        const prefix = 'env.prefix';
        beforeEach(() => {
          loggerOpts = {host: 'test.test.com', statsd: loggerSpy, prefix: prefix};
          logger = new DaptivMetricsLogger(loggerOpts);
        });

        it('should lowercase prefix and replace all non-alphanumeric characters (or . ) with _', () => {
            let oddPrefix       = 'Environment.Prefix&format test';
            let formattedPrefix = 'environment.prefix_format_test';
            let key = 'my.key';

            loggerOpts = {host: 'test.test.com', statsd: loggerSpy, prefix: oddPrefix};
            logger = new DaptivMetricsLogger(loggerOpts);
            logger.increment(key);

            expect(loggerSpy.increment).toHaveBeenCalledWith(`${formattedPrefix}.${key}`, undefined, undefined);
        });

        it('gauge should prefix key with env key', () => {
            let key = 'test.key';
            let value = 29;

            logger.gauge(key, value);

            expect(loggerSpy.gauge).toHaveBeenCalledWith(`${prefix}.${key}`, value, undefined, undefined);
        });

        it('increment should prefix key with env key', () => {
            let key = 'test.key';

            logger.increment(key);

            expect(loggerSpy.increment).toHaveBeenCalledWith(`${prefix}.${key}`, undefined, undefined);
        });

        it('timing should prefix key with env key', () => {
            let key = 'test.key';
            let value = 37;

            logger.timing(key, value);

            expect(loggerSpy.timing).toHaveBeenCalledWith(`${prefix}.${key}`, value, undefined, undefined);
        });
    });
});
