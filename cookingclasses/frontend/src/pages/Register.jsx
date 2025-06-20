import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/users";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    try {
      await registerUser({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.error || "Ошибка регистрации");
    }
  };

  return (
    <div className="register" id="main-content">
      <div className="register__container">
        <h1 className="register__title">Регистрация</h1>
        {error && <p className="register__error">{error}</p>}
        <form onSubmit={handleSubmit} className="register__form">
          <div className="register__field">
            <label className="register__label">Имя:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Фамилия:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Логин:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="register__input"
            />
          </div>
          <div className="register__field">
            <label className="register__label">Повтор пароля:</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="register__input"
            />
          </div>
          <button type="submit" className="register__button">
            Зарегистрироваться
          </button>
          <p className="register__login-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
        <div className="register__social">
          <button
            className="register__social-button register__social-vk"
            disabled
          >
            Войти через VK ID
          </button>
          <button
            className="register__social-button register__social-google"
            disabled
          >
            Войти через Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
