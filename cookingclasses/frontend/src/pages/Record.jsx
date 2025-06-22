import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { masterClassesApi } from "../api/workshops";
import Breadcrumbs from "../components/Breadcrumbs";
import PropTypes from "prop-types";

function RecordMasterClass() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [masterClass, setMasterClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchMasterClass = async () => {
      try {
        setLoading(true);
        setError(null);
        const masterClassId = state?.masterClassId;
        if (!masterClassId) throw new Error("Мастер-класс не указан");
        const data = await masterClassesApi.getDetail(masterClassId);
        setMasterClass(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Ошибка при загрузке мастер-класса");
        setLoading(false);
      }
    };
    fetchMasterClass();
  }, [state]);

  const validateForm = () => {
    const errors = {};
    // 4.1: Валидация доступности билетов
    if (!tickets || tickets < 1) {
      errors.tickets = "Укажите количество билетов (не менее 1)";
    } else if (masterClass && tickets > masterClass.seats_available) {
      errors.tickets = `Доступно только ${masterClass.seats_available} мест`;
    }
    // 4.4: Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Укажите корректный email";
    }
    // 4.4: Валидация телефона
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phone || !phoneRegex.test(phone)) {
      errors.phone = "Укажите корректный номер телефона (10-15 цифр)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTicketChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= masterClass?.seats_available) {
      setTickets(value);
    }
  };

  const incrementTickets = () => {
    if (tickets < masterClass?.seats_available) {
      setTickets(tickets + 1);
    }
  };

  const decrementTickets = () => {
    if (tickets > 1) {
      setTickets(tickets - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const totalPrice = (masterClass.price * tickets).toFixed(2);
      await masterClassesApi.createRecord({
        master_class: masterClass.id,
        payment_status: "Ожидание",
        email,
        phone,
        tickets,
        total_price: parseFloat(totalPrice),
      });
      navigate("/master-class-list", {
        state: {
          message: "Запись успешно создана! Ожидайте подтверждения оплаты.",
        },
      });
    } catch (err) {
      console.error("Ошибка API:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Ошибка при создании записи");
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!masterClass) return <div className="error">Мастер-класс не найден</div>;

  const totalPrice = (masterClass.price * tickets).toFixed(2);

  return (
    <div className="record-master-class" id="main-content">
      <Breadcrumbs />
      <h1 className="record-master-class__title">
        Запись на мастер-класс: {masterClass.title}
      </h1>
      <div className="record-master-class__info">
        <img
          src={masterClass.image || "/static/images/placeholder.jpg"}
          alt={masterClass.title}
          className="record-master-class__image"
        />
        <div className="record-master-class__details">
          <p className="record-master-class__price">
            Цена за билет: {masterClass.price} руб.
          </p>
          <p className="record-master-class__total-price">
            Общая цена: {totalPrice} руб.
          </p>
          <p className="record-master-class__seats">
            Свободных мест: {masterClass.seats_available} из{" "}
            {masterClass.seats_total}
          </p>
          <p className="record-master-class__date">
            Дата:{" "}
            {new Date(masterClass.date_event).toLocaleDateString("ru-RU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="record-master-class__restaurant">
            Ресторан: {masterClass.restaurant?.name || "Не указан"}
          </p>
        </div>
      </div>
      <form className="record-master-class__form" onSubmit={handleSubmit}>
        <div className="record-master-class__form-group">
          <label htmlFor="tickets">Количество билетов</label>
          <div className="ticket-counter">
            <button
              type="button"
              className="ticket-counter__button"
              onClick={decrementTickets}
              disabled={tickets <= 1}
            >
              −
            </button>
            <input
              type="number"
              id="tickets"
              value={tickets}
              onChange={handleTicketChange}
              min="1"
              max={masterClass.seats_available}
              className="ticket-counter__input"
            />
            <button
              type="button"
              className="ticket-counter__button"
              onClick={incrementTickets}
              disabled={tickets >= masterClass.seats_available}
            >
              +
            </button>
          </div>
          {formErrors.tickets && <p className="error">{formErrors.tickets}</p>}
        </div>
        <div className="record-master-class__form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="record-master-class__input"
          />
          {formErrors.email && <p className="error">{formErrors.email}</p>}
        </div>
        <div className="record-master-class__form-group">
          <label htmlFor="phone">Телефон</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="record-master-class__input"
          />
          {formErrors.phone && <p className="error">{formErrors.phone}</p>}
        </div>
        <button type="submit" className="record-master-class__submit-button">
          Перейти к оплате
        </button>
      </form>
    </div>
  );
}

RecordMasterClass.propTypes = {
  state: PropTypes.shape({
    masterClassId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
  }),
};

export default RecordMasterClass;
