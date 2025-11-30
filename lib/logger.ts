export function logInfo(message: string, meta: any = {}) {
    console.log(JSON.stringify({ level: "info", message, ...meta }));
  }
  
  export function logWarn(message: string, meta: any = {}) {
    console.warn(JSON.stringify({ level: "warn", message, ...meta }));
  }
  
  export function logError(message: string, meta: any = {}) {
    console.error(JSON.stringify({ level: "error", message, ...meta }));
  }
  