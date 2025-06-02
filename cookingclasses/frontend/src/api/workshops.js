import axios from "axios";
import qs from "qs";

axios.defaults.withCredentials = true;

const API_BASE_URL = "/api/workshops";

function getCsrfToken() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrftoken=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Кухни
export const getCuisines = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cuisines/`);
    return response.data.map((cuisine) => ({ ...cuisine, selected: false }));
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить кухни" };
  }
};

// Рестораны
export const getRestaurants = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurants/`);
    return response.data.map((restaurant) => ({
      ...restaurant,
      selected: false,
    }));
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить рестораны" };
  }
};

export const getRestaurantDetail = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurants/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить ресторан" };
  }
};

// Шеф-повара
export const getChefs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chefs/`);
    return response.data.map((chef) => ({ ...chef, selected: false }));
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить шеф-поваров" };
  }
};

export const getChefDetail = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chefs/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить шеф-повара" };
  }
};

// Фотографии ресторанов
export const getRestaurantImages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurant-images/`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { error: "Не удалось загрузить фото ресторанов" }
    );
  }
};

// Мастер-классы
export const masterClassesApi = {
  getList: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/master-classes/`, {
        params,
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: "repeat" });
        },
      });

      return response.data.results || response.data;
    } catch (error) {
      console.error("MasterClasses API error:", error);
      throw (
        error.response?.data || {
          error: error.message || "Не удалось загрузить мастер-классы",
        }
      );
    }
  },

  getDetail: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/master-classes/${id}/`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          error: "Не удалось загрузить мастер-класс",
        }
      );
    }
  },
};

// Записи
export const getRecords = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/records/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить записи" };
  }
};

// Отзывы
export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reviews/`, reviewData, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось создать отзыв" };
  }
};

export const deleteReview = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/reviews/${id}/`, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
  } catch (error) {
    throw error.response?.data || { error: "Не удалось удалить отзыв" };
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/reviews/${id}/`,
      reviewData,
      {
        headers: { "X-CSRFToken": getCsrfToken() },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось обновить отзыв" };
  }
};

export const getReviews = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/`, { params });
    return response.data.results || response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить отзывы" };
  }
};

// Видео
export const getVideos = async (filters = {}, page = 1) => {
  try {
    const params = new URLSearchParams();
    if (filters.maxDurationSeconds)
      params.append("max_duration_seconds", filters.maxDurationSeconds);
    if (filters.minLikes) params.append("min_likes", filters.minLikes);
    if (filters.minComments) params.append("min_comments", filters.minComments);
    if (filters.sortField) {
      const direction = filters.sortDirection === "asc" ? "" : "-";
      params.append("ordering", `${direction}${filters.sortField}`);
    }
    params.append("page", page);

    console.log(
      "API request URL:",
      `${API_BASE_URL}/videos/?${params.toString()}`
    );
    const response = await axios.get(
      `${API_BASE_URL}/videos/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.detail || "Ошибка загрузки видео",
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
    };
  }
};

export const getVideoDetail = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить видео" };
  }
};

// Лайки
export const getLikes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/likes/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить лайки" };
  }
};

export const createLike = async (likeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/likes/`, likeData, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось поставить лайк" };
  }
};

export const deleteLike = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/likes/${id}/`, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return true;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось удалить лайк" };
  }
};

export const getComments = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(
      `${API_BASE_URL}/comments/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить комментарии" };
  }
};
