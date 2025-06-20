import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/users";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser({
        username: formData.username,
        password: formData.password,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.error || "Ошибка входа");
    }
  };

  return (
    <div className="login" id="main-content">
      <div className="login__container">
        <h1 className="login__title">Вход</h1>
        {error && <p className="login__error">{error}</p>}
        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__field">
            <label className="login__label">Email:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="login__input"
            />
          </div>
          <div className="login__field">
            <label className="login__label">Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="login__input"
            />
          </div>
          <button type="submit" className="login__button">
            Войти
          </button>
          <p className="login__register-link">
            Зарегистрироваться <Link to="/register">здесь</Link>
          </p>
        </form>
        <div className="login__social">
          <button className="login__social-button login__social-vk" disabled>
            Войти через VK ID
          </button>
          <button
            className="login__social-button login__social-google"
            disabled
          >
            Войти через Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
