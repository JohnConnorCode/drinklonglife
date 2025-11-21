type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Redact sensitive data from log messages to prevent leaking:
   * - Email addresses
   * - Price IDs (Stripe)
   * - Customer IDs (Stripe)
   * - API keys
   * - Credit card numbers (partial)
   */
  private redactSensitiveData(args: any[]): any[] {
    if (this.isDevelopment) {
      // In development, don't redact for easier debugging
      return args;
    }

    return args.map(arg => {
      if (typeof arg === 'string') {
        return arg
          // Redact emails: user@domain.com → u***@domain.com
          .replace(/([a-zA-Z0-9._-]{1})[a-zA-Z0-9._-]+@/g, '$1***@')
          // Redact Stripe price IDs: price_abc123... → price_***
          .replace(/price_[a-zA-Z0-9]{10,}/g, 'price_***')
          // Redact Stripe customer IDs: cus_abc123... → cus_***
          .replace(/cus_[a-zA-Z0-9]{10,}/g, 'cus_***')
          // Redact API keys: sk_test_abc... or pk_live_xyz → ***_***
          .replace(/(sk|pk)_(test|live)_[a-zA-Z0-9]{20,}/g, '$1_$2_***');
      } else if (typeof arg === 'object' && arg !== null) {
        // Deep clone and redact object properties
        const cloned = JSON.parse(JSON.stringify(arg));
        this.redactObjectProperties(cloned);
        return cloned;
      }
      return arg;
    });
  }

  /**
   * Recursively redact sensitive properties in objects
   */
  private redactObjectProperties(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;

    const sensitiveKeys = ['email', 'password', 'apiKey', 'token', 'secret', 'priceId', 'customerId', 'card'];

    for (const key in obj) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object') {
        this.redactObjectProperties(obj[key]);
      }
    }
  }

  private log(level: LogLevel, ...args: any[]) {
    const redactedArgs = this.redactSensitiveData(args);

    // In development: log everything to console
    if (this.isDevelopment) {
      console[level](...redactedArgs);
      return;
    }

    // In production: only log warnings and errors to console
    // This ensures critical issues are visible in Vercel logs
    if (level === 'warn' || level === 'error') {
      console.error(`[${level.toUpperCase()}]`, ...redactedArgs);
    }

    // TODO: Send to external logging service (e.g., Sentry, LogRocket, Datadog)
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureMessage(redactedArgs.join(' '));
    // }
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }
}

export const logger = new Logger();
