import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getRestaurantDetail,
  updateRestaurant,
  deleteRestaurant,
} from "../api/workshops";
import { getCurrentUser } from "../api/users";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    opening_hours: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Загрузка данных ресторана и текущего пользователя
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user.is_staff);
        const data = await getRestaurantDetail(id);
        console.log("RestaurantDetail data:", data);
        setRestaurant(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          opening_hours: data.opening_hours || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Обработчик обновления ресторана
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedRestaurant = await updateRestaurant(id, formData);
      setRestaurant(updatedRestaurant);
      setEditMode(false);
      alert("Ресторан успешно обновлён");
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert(error.error || "Ошибка при обновлении ресторана");
    }
  };

  // Обработчик удаления ресторана
  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить ресторан?")) {
      try {
        await deleteRestaurant(id);
        navigate("/restaurants");
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        alert(error.error || "Ошибка при удалении ресторана");
      }
    }
  };

  // Переключение на следующее изображение
  const nextImage = () => {
    if (restaurant && restaurant.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === restaurant.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Переключение на предыдущее изображение
  const prevImage = () => {
    if (restaurant && restaurant.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? restaurant.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (!restaurant) return <p>Ресторан не найден</p>;

  return (
    <div className="restaurant-detail">
      <h2 className="restaurant-title">{restaurant.name}</h2>

      {/* Карусель изображений */}
      {restaurant.images && restaurant.images.length > 0 ? (
        <div className="carousel">
          <button className="carousel-button prev" onClick={prevImage}>
            ←
          </button>
          <img
            src={restaurant.images[currentImageIndex].image}
            alt={`Image ${currentImageIndex + 1}`}
            className="carousel-image"
          />
          <button className="carousel-button next" onClick={nextImage}>
            →
          </button>
          <div className="carousel-indicators">
            {restaurant.images.map((_, index) => (
              <span
                key={index}
                className={`indicator ${
                  index === currentImageIndex ? "active" : ""
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="no-image">Нет фотографий</div>
      )}

      {/* Информация о ресторане */}
      <div className="restaurant-info">
        <p className="restaurant-description">
          <strong>Описание:</strong> {restaurant.description || "Не указано"}
        </p>
        <p className="restaurant-address">
          <strong>Адрес:</strong> {restaurant.address || "Не указано"}
        </p>
        <p className="restaurant-phone">
          <strong>Телефон:</strong> {restaurant.phone || "Не указано"}
        </p>
        <p className="restaurant-email">
          <strong>Email:</strong> {restaurant.email || "Не указано"}
        </p>
        <p className="restaurant-website">
          <strong>Веб-сайт:</strong>{" "}
          {restaurant.website ? (
            <a
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {restaurant.website}
            </a>
          ) : (
            "Не указано"
          )}
        </p>
        <p className="restaurant-opening-hours">
          <strong>Часы работы:</strong>{" "}
          {restaurant.opening_hours || "Не указано"}
        </p>
      </div>

      {isAdmin && (
        <div className="admin-controls">
          <button
            onClick={() => setEditMode(!editMode)}
            className="edit-button"
          >
            {editMode ? "Отмена" : "Редактировать"}
          </button>
          <button onClick={handleDelete} className="delete-button">
            Удалить
          </button>

          {/* Форма редактирования */}
          {editMode && (
            <form onSubmit={handleUpdate} className="edit-form">
              <h3>Редактировать ресторан</h3>
              <input
                type="text"
                placeholder="Название"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Описание"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Адрес"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
              <input
                type="tel"
                placeholder="Телефон"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="Веб-сайт"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Часы работы"
                value={formData.opening_hours}
                onChange={(e) =>
                  setFormData({ ...formData, opening_hours: e.target.value })
                }
              />
              <button type="submit">Сохранить</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
