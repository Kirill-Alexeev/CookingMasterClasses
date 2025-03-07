import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserProfile, logoutUser } from "../api/users";
import kylinarLogo from "../assets/icons/kylinar_logo.svg";
import mailIcon from "../assets/icons/mail_icon.svg";
import phoneIcon from "../assets/icons/phone_icon.svg";

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
    <header className="header">
      <div className="header__top">
        <div className="header__logo">
          <img src={kylinarLogo} alt="Кулинар" className="header__logo-img" />
        </div>
        <div className="header__search">
          <input
            type="text"
            placeholder="Поиск по сайту"
            className="header__search-input"
          />
        </div>
        <div className="contacts">
          <a href="mailto:kylinar@mail.ru" className="contacts__email">
            <img src={mailIcon} className="contacts__img" />
            kylinar@mail.ru
          </a>
          <a href="tel:+79500000000" className="contacts__phone">
            <img src={phoneIcon} className="contacts__img" />
            +7 (950) 000-00-00
          </a>
        </div>
      </div>
      <nav className="header__nav">
        <ul className="header__nav-list">
          <li className="header__nav-item">
            <NavLink to="/" className="header__nav-link" end>
              Главная
            </NavLink>
          </li>
          <li className="header__nav-item">
            <NavLink to="/restaurant-list" className="header__nav-link">
              Рестораны
            </NavLink>
          </li>
          <li className="header__nav-item">
            <NavLink to="/master-class-list" className="header__nav-link">
              Мастер-классы
            </NavLink>
          </li>
          <li className="header__nav-item">
            <NavLink to="/video-list" className="header__nav-link">
              Видео
            </NavLink>
          </li>
          {user ? (
            <>
              <li className="header__nav-item">
                <NavLink to="/profile" className="header__nav-link">
                  Профиль
                </NavLink>
              </li>
              <li className="header__nav-item">
                <button className="header__nav-button" onClick={handleLogout}>
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="header__nav-item">
                <NavLink to="/register" className="header__nav-link">
                  Зарегистрироваться
                </NavLink>
              </li>
              <li className="header__nav-item">
                <NavLink to="/login" className="header__nav-link">
                  Войти
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
