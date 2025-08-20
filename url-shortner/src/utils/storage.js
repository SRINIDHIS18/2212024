import logger from './logger';

const STORAGE_KEY = 'urlMappings';

export const getMappings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    logger('error', `Failed to get mappings: ${error.message}`);
    return {};
  }
};

export const saveMappings = (mappings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    logger('info', 'Mappings saved successfully');
  } catch (error) {
    logger('error', `Failed to save mappings: ${error.message}`);
  }
};

export const addClick = (shortcode, clickData) => {
  const mappings = getMappings();
  if (mappings[shortcode]) {
    mappings[shortcode].clicks.push(clickData);
    saveMappings(mappings);
    logger('info', `Click added for shortcode: ${shortcode}`);
  } else {
    logger('warn', `Shortcode not found for click: ${shortcode}`);
  }
};