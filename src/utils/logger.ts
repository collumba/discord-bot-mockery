const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  },
  
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
  
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  },
  
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`);
      if (data) {
        console.log(data);
      }
    }
  }
};

export default logger; 