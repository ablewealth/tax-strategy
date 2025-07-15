/**
 * Logger utility for the tax strategy application
 * Provides environment-aware logging functions
 */

const logger = {
  log: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(message, ...args);
    }
  },
  error: (message, ...args) => {
    // eslint-disable-next-line no-console
    console.error(message, ...args);
  },
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(message, ...args);
    }
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(message, ...args);
    }
  },
};

export default logger;
