
const LOG_API_URL = 'http://20.244.56.144/evaluation-service/logs';

const logToApi = async (stack, level, packageName, message) => {
  try {
    const response = await fetch(LOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: packageName.toLowerCase(),
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
   
  } catch (error) {
    
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.push({ stack, level, package: packageName, message, timestamp: new Date().toISOString() });
    localStorage.setItem('logs', JSON.stringify(logs));
  }
};

const Log = (stack, level, packageName, message, callback = () => {}) => {
  
  const validStacks = ['backend', 'frontend'];
  const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
  const validPackages = ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'];

  if (!validStacks.includes(stack.toLowerCase())) {
    throw new Error(`Invalid stack: ${stack}. Must be 'backend' or 'frontend'.`);
  }
  if (!validLevels.includes(level.toLowerCase())) {
    throw new Error(`Invalid level: ${level}. Must be one of ${validLevels.join(', ')}.`);
  }
  if (!validPackages.includes(packageName.toLowerCase())) {
    throw new Error(`Invalid package: ${packageName}. Must be one of ${validPackages.join(', ')}.`);
  }

  
  logToApi(stack.toLowerCase(), level.toLowerCase(), packageName.toLowerCase(), message).then(() => {
    callback(); 
  }).catch((error) => {
    
    callback(); 
  });
};

export default Log;

//"clientID": "6804cf2d-114a-48db-84ff-02d15279a4f1",
// "clientSecret": "fQWpqsBjdTzRzkMQ"

