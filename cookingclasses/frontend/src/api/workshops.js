import axios from "axios";

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
export const getMasterClasses = async (filters = {}, sort = {}) => {
  const params = new URLSearchParams();

  // Фильтры
  if (filters.minPrice) params.append("min_price", filters.minPrice);
  if (filters.maxPrice) params.append("max_price", filters.maxPrice);
  if (filters.minDate) params.append("min_date", filters.minDate.toISOString());
  if (filters.maxDate) params.append("max_date", filters.maxDate.toISOString());
  if (filters.minRating) params.append("min_rating", filters.minRating);
  if (filters.maxRating) params.append("max_rating", filters.maxRating);
  if (filters.complexities?.length) {
    filters.complexities.forEach((complexity) =>
      params.append("complexity", complexity)
    );
  }
  if (filters.cuisines?.length) {
    filters.cuisines.forEach((cuisine) => params.append("cuisine_id", cuisine));
  }
  if (filters.restaurants?.length) {
    filters.restaurants.forEach((restaurant) =>
      params.append("restaurant", restaurant)
    );
  }
  if (filters.chefs?.length) {
    filters.chefs.forEach((chef) => params.append("chefs", chef));
  }

  // Сортировка
  if (sort.field) {
    const ordering = sort.direction === "asc" ? sort.field : `-${sort.field}`;
    params.append("ordering", ordering);
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/master-classes/`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { error: "Не удалось загрузить мастер-классы" }
    );
  }
};

export const getMasterClassDetail = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master-classes/${id}/`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { error: "Не удалось загрузить мастер-класс" }
    );
  }
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
