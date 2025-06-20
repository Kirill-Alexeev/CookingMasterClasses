import axios from "axios";
import qs from "qs";

axios.defaults.withCredentials = true;

const API_BASE_URL = "/api/workshops";

export function getCsrfToken() {
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
export const getChefs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chefs/`, {
      params,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    });
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

// Видео
export const getVideos = async (params = {}, page = 1) => {
  try {
    const queryParams = {
      ...params,
      page,
    };
    console.log("API getVideos params:", queryParams);
    const response = await axios.get(`${API_BASE_URL}/videos/`, {
      params: queryParams,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    });
    console.log("API getVideos response:", response.data);
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
    throw {
      error: error.response?.data?.detail || "Ошибка загрузки видео",
      status: error.response?.status,
    };
  }
};

export const createComment = async (commentData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/comments/`,
      commentData,
      {
        headers: { "X-CSRFToken": getCsrfToken() },
      }
    );
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.detail || "Ошибка при создании комментария",
      status: error.response?.status,
    };
  }
};

export const updateComment = async (id, commentData) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/comments/${id}/`,
      commentData,
      {
        headers: { "X-CSRFToken": getCsrfToken() },
      }
    );
    return response.data;
  } catch (error) {
    throw {
      error:
        error.response?.data?.detail || "Ошибка при обновлении комментария",
      status: error.response?.status,
    };
  }
};

export const deleteComment = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/comments/${id}/`, {
      headers: { "X-CSRFToken": getCsrfToken() },
    });
    return { success: true };
  } catch (error) {
    throw {
      error: error.response?.data?.detail || "Ошибка при удалении комментария",
      status: error.response?.status,
    };
  }
};

export const createLike = async (likeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/likes/`, likeData, {
      headers: {
        "X-CSRFToken": getCsrfToken(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw {
      error: error.response?.data?.detail || "Ошибка при создании лайка",
      status: error.response?.status,
    };
  }
};

export const deleteLike = async ({ video, user }) => {
  try {
    // Сначала находим ID лайка
    const likes = await getLikes({ video, user });
    if (likes.length === 0) {
      throw { error: "Лайк не найден", status: 404 };
    }
    const likeId = likes[0].id;
    const response = await axios.delete(`${API_BASE_URL}/likes/${likeId}/`, {
      headers: {
        "X-CSRFToken": getCsrfToken(),
      },
      withCredentials: true,
    });
    return response.data || { success: true };
  } catch (error) {
    throw {
      error: error.response?.data?.detail || "Ошибка при удалении лайка",
      status: error.response?.status,
    };
  }
};

export const getRecords = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/records/`);
    console.log("API getRecords response:", response.data);
    return response.data.results || response.data || [];
  } catch (error) {
    console.error(
      "API getRecords error:",
      error.response?.data || error.message
    );
    throw error.response?.data || { error: "Не удалось загрузить записи" };
  }
};

export const getReviews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/`);
    console.log("API getReviews response:", response.data);
    return response.data.results || response.data || [];
  } catch (error) {
    console.error(
      "API getReviews error:",
      error.response?.data || error.message
    );
    throw error.response?.data || { error: "Не удалось загрузить отзывы" };
  }
};

export const getComments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/comments/`);
    console.log("API getComments response:", response.data);
    return response.data.results || response.data || [];
  } catch (error) {
    console.error(
      "API getComments error:",
      error.response?.data || error.message
    );
    throw error.response?.data || { error: "Не удалось загрузить комментарии" };
  }
};

export const getLikes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/likes/`);
    console.log("API getLikes response:", response.data);
    return response.data.results || response.data || [];
  } catch (error) {
    console.error("API getLikes error:", error.response?.data || error.message);
    throw error.response?.data || { error: "Не удалось загрузить лайки" };
  }
};
