export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  }
};
