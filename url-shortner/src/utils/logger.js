const logger = (level, message) => {
  const logs = JSON.parse(localStorage.getItem('logs') || '[]');
  logs.push({ level, message, timestamp: new Date().toISOString() });
  localStorage.setItem('logs', JSON.stringify(logs));
};

export default logger;