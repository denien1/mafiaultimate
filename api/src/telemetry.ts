import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable verbose only if needed
if (process.env.OTEL_DEBUG === '1') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

export const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});
