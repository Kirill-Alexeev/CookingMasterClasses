import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserProfile, logoutUser } from "../api/users";

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUserProfile()
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser()
      .then(() => {
        setUser(null);
        navigate("/");
      })
      .catch((err) => console.error(err));
  };

  return (
    <header>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end>
              Главная
            </NavLink>
          </li>
          <li>
            <NavLink to="/restaurant-list">Рестораны</NavLink>
          </li>
          <li>
            <NavLink to="/master-class-list">Мастер-классы</NavLink>
          </li>
          <li>
            <NavLink to="/video-list">Видео</NavLink>
          </li>
          {user ? (
            <>
              <li>
                <NavLink to="/profile">Профиль</NavLink>
              </li>
              <li>
                <button onClick={handleLogout}>Выйти</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/register">Зарегистрироваться</NavLink>
              </li>
              <li>
                <NavLink to="/login">Войти</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
