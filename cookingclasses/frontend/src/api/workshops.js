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
export const getReviews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить отзывы" };
  }
};

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

// Видео
export const getVideos = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Не удалось загрузить видео" };
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

export const getFilteredVideos = async (filters, page = 1) => {
  try {
    const params = new URLSearchParams({
      max_duration: filters.maxDuration || "",
      recent_days: filters.recentDays || "",
      username: filters.username || "",
      comment_text: filters.commentText || "",
      sort_field: filters.sortField || "created_at",
      sort_direction: filters.sortDirection || "desc",
      page,
    });
    console.log(
      "Filtered videos URL:",
      `${API_BASE_URL}/videos/filtered?${params.toString()}`
    );
    const response = await axios.get(
      `${API_BASE_URL}/videos/filtered?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Get filtered videos error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });
    throw (
      error.response?.data || {
        error: `Не удалось загрузить отфильтрованные видео: ${error.message}`,
      }
    );
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
