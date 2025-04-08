const HISTORY_KEY = "navigationHistory";

export const getNavigationHistory = () => {
  const history = sessionStorage.getItem(HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const addToNavigationHistory = (path, name) => {
  const history = getNavigationHistory();

  const existingIndex = history.findIndex((item) => item.path === path);
  if (existingIndex !== -1) {
    history.splice(existingIndex + 1);
  } else {
    history.push({ path, name });
  }

  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const clearNavigationHistory = () => {
  sessionStorage.removeItem(HISTORY_KEY);
};
