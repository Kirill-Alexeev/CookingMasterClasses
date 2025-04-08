import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import {
  getMasterClassDetail,
  getChefs,
  getRestaurants,
} from "../api/workshops";
import Breadcrumbs from "../components/Breadcrumbs";
import raitingStarIcon from "../assets/icons/raiting_star_icon.svg";

function MasterClassDetail() {
  const { id } = useParams();
  const [masterClass, setMasterClass] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const masterClassData = await getMasterClassDetail(id);
        setMasterClass(masterClassData);

        const chefsData = await getChefs();
        const relatedChefs = chefsData.filter((chef) =>
          masterClassData.chefs.includes(chef.id)
        );
        setChefs(relatedChefs);

        const restaurantsData = await getRestaurants();
        const relatedRestaurant = restaurantsData.find(
          (rest) => rest.id === masterClassData.restaurant
        );
        setRestaurant(relatedRestaurant);

        setLoading(false);
      } catch (err) {
        setError(err.error || "Ошибка при загрузке данных");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="mc-detail">
      <div className="mc-detail__header">
        <Breadcrumbs />
        <div className="mc-detail__info">
          <div className="mc-detail__info-top">
            <img
              src={masterClass.image}
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
            {new Date(masterClass.date_event).toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mc-detail__event-time">
            {new Date(masterClass.date_event).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="mc-detail__event-restaurant">
            {restaurant ? restaurant.name : "Ресторан не указан"}
          </p>
          <p className="mc-detail__event-location">
            {restaurant ? restaurant.address : "Адрес не указан"}
          </p>
        </div>
        <p className="mc-detail__event-rating">
          <img
            src={raitingStarIcon}
            className="mc-detail__rating-star"
            alt="Рейтинг"
          />
          {masterClass.raiting || 0}
        </p>
      </div>

      <div className="mc-detail__description">
        <h2>О мастер-классе</h2>
        <p>{masterClass.description}</p>
      </div>

      <div className="mc-detail__chefs">
        <h2>Занятие будут вести</h2>
        {chefs.length > 0 ? (
          <div className="mc-detail__chefs-list">
            {chefs.map((chef) => (
              <div key={chef.id} className="mc-detail__chef">
                <img
                  src={chef.image}
                  alt={`${chef.last_name} ${chef.first_name}`}
                  className="mc-detail__chef-image"
                />
                <div className="mc-detail__chef-info">
                  <h3 className="mc-detail__chef-name">
                    {chef.last_name} {chef.first_name}
                  </h3>
                  <p className="mc-detail__chef-bio">{chef.profession}</p>
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
