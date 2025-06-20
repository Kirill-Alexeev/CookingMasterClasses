import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL = "/api/users";

function getCsrfToken() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register/`, userData, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        error: "Не удалось зарегистрировать нового пользователя",
      }
    );
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login/`, credentials, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось войти" };
  }
};

export const logoutUser = async () => {
  try {
    await axios.post(
      `${API_BASE_URL}/logout/`,
      {},
      {
        headers: { "X-CSRFToken": getCsrfToken() },
      }
    );
    return true;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось выйти" };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить профиль" };
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/profile/`, userData, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось обновить профиль" };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/current-user/`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        error: "Не удалось получить текущего пользователя",
      }
    );
  }
};

export const deleteUserProfile = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/delete/`, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось удалить профиль" };
  }
};
