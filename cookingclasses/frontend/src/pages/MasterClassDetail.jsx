import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { masterClassesApi } from "../api/workshops";
import Breadcrumbs from "../components/Breadcrumbs";
import raitingStarIcon from "../assets/icons/raiting_star_icon.svg";

function MasterClassDetail() {
  const { id } = useParams();
  const [masterClass, setMasterClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const masterClassData = await masterClassesApi.getDetail(id);
        setMasterClass(masterClassData);
        setLoading(false);
      } catch (err) {
        setError(err.error?.message || "Ошибка при загрузке данных");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? "Некорректная дата"
      : date.toLocaleDateString("ru-RU", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? "Некорректное время"
      : date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="mc-detail">
      <div className="mc-detail__header">
        <Breadcrumbs />
        <div className="mc-detail__info">
          <div className="mc-detail__info-top">
            <img
              src={masterClass.image || "/placeholder.jpg"} // Добавлено: заглушка для изображения
              alt={masterClass.title}
              className="mc-detail__info-img"
            />
            <h1 className="mc-detail__title">{masterClass.title}</h1>
          </div>
          <div className="mc-detail__info-bottom">
            <p className="mc-detail__price">{masterClass.price} руб.</p>
            <p className="mc-detail__seats">
              {masterClass.seats_available} из {masterClass.seats_total} мест
            </p>
            <NavLink
              to={`/record`}
              state={{ title: "Запись на мастер-класс" }}
              className="mc-detail__signup-button"
              end
            >
              Записаться
            </NavLink>
          </div>
        </div>
      </div>

      <div className="mc-detail__event-info">
        <div className="mc-detail__event-left">
          <p className="mc-detail__event-date">
            {formatDate(masterClass.date_event)}
          </p>
          <p className="mc-detail__event-time">
            {formatTime(masterClass.date_event)}
          </p>
          <p className="mc-detail__event-restaurant">
            {masterClass.restaurant?.name || "Ресторан не указан"}
          </p>
          <p className="mc-detail__event-location">
            {masterClass.restaurant?.address || "Адрес не указан"}
          </p>
        </div>
        <p className="mc-detail__event-rating">
          <img
            src={raitingStarIcon}
            className="mc-detail__rating-star"
            alt="Рейтинг"
          />
          {masterClass.rating || 0} {/* Исправлено: raiting → rating */}
        </p>
      </div>

      <div className="mc-detail__description">
        <h2>О мастер-классе</h2>
        <p>{masterClass.description || "Описание отсутствует"}</p>
      </div>

      <div className="mc-detail__chefs">
        <h2>Занятие будут вести</h2>
        {masterClass.chefs?.length > 0 ? (
          <div className="mc-detail__chefs-list">
            {masterClass.chefs.map((chef) => (
              <div key={chef.id} className="mc-detail__chef">
                <img
                  src={chef.image || "/placeholder.jpg"} // Добавлено: заглушка для изображения
                  alt={`${chef.last_name} ${chef.first_name}`}
                  className="mc-detail__chef-image"
                />
                <div className="mc-detail__chef-info">
                  <h3 className="mc-detail__chef-name">
                    {chef.last_name} {chef.first_name}
                  </h3>
                  <p className="mc-detail__chef-bio">
                    {chef.profession || "Профессия не указана"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mc-detail__chef-nothing">Шеф-повара не назначены.</p>
        )}
      </div>
    </div>
  );
}

export default MasterClassDetail;
