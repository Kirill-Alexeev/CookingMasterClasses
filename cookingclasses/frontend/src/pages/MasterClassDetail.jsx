import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { masterClassesApi, getReviews } from "../api/workshops";
import { getCurrentUser } from "../api/users";
import Breadcrumbs from "../components/Breadcrumbs";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import raitingStarIcon from "../assets/icons/raiting_star_icon.svg";
import PropTypes from "prop-types";

function MasterClassDetail() {
  const { id } = useParams();
  const [masterClass, setMasterClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setReviews([]);
        setLoading(true);
        setError(null);
        const [masterClassData, reviewsData, userData] = await Promise.all([
          masterClassesApi.getDetail(id),
          getReviews({ master_class: id }),
          getCurrentUser().catch(() => null), // Обработка неавторизованного пользователя
        ]);
        setMasterClass(masterClassData);
        setReviews(reviewsData);
        setCurrentUser(userData);
        console.log("Current user:", userData); // Отладка
        setLoading(false);
      } catch (err) {
        setError(err.error?.message || "Ошибка при загрузке данных");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(reviews.filter((review) => review.id !== reviewId));
  };

  const handleReviewUpdated = (reviewId, newText, newRating) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, comment: newText, rating: newRating }
          : review
      )
    );
  };

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
          {masterClass.rating || 0}
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
                  src={chef.image}
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

      <div className="mc-reviews-section">
        <ReviewForm
          masterClassId={id}
          onReviewAdded={handleReviewAdded}
          currentUser={currentUser}
        />
        <ReviewList
          reviews={reviews}
          onDelete={handleReviewDeleted}
          onUpdate={handleReviewUpdated}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

MasterClassDetail.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
  }),
};

MasterClassDetail.defaultProps = {
  currentUser: null,
};

export default MasterClassDetail;
