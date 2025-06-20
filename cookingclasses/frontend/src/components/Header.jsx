import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserProfile, logoutUser } from "../api/users";
import kylinarLogo from "../assets/icons/kylinar_logo.svg";
import mailIcon from "../assets/icons/mail_icon.svg";
import phoneIcon from "../assets/icons/phone_icon.svg";
import locationIcon from "../assets/icons/location_icon.svg";

function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        setIsMenuOpen(false);
      })
      .catch((err) => console.error(err));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header__wrapper">
        <div className="header__location">
          <button className="header__location-btn">
            <img
              src={locationIcon}
              className="header__location-img"
              alt="Location"
            />
            Ваш адрес
          </button>
        </div>
        <div className="header__top">
          <NavLink to="/" className="header__logo" end>
            <img src={kylinarLogo} alt="Кулинар" className="header__logo-img" />
          </NavLink>
          <div className="header__contacts">
            <a href="mailto:kylinar@mail.ru" className="header__contacts-link">
              <img
                src={mailIcon}
                className="header__contacts-img"
                alt="Email"
              />
              kylinar@mail.ru
            </a>
            <a href="tel:+79500000000" className="header__contacts-link">
              <img
                src={phoneIcon}
                className="header__contacts-img"
                alt="Phone"
              />
              +7 (950) 000-00-00
            </a>
          </div>
          <button
            className="header__burger"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="header__burger-line"></span>
            <span className="header__burger-line"></span>
            <span className="header__burger-line"></span>
          </button>
        </div>
        <nav className={`header__nav ${isMenuOpen ? "header__nav--open" : ""}`}>
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <NavLink
                to="/"
                className="header__nav-link"
                end
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink
                to="/restaurant-list"
                state={{ title: "Рестораны" }}
                className="header__nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Рестораны
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink
                to="/master-class-list"
                state={{ title: "Мастер-классы" }}
                className="header__nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Мастер-классы
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink
                to="/video-list"
                state={{ title: "Видео-уроки" }}
                className="header__nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Видео-уроки
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="header__nav-item">
                  <NavLink
                    to="/profile"
                    className="header__nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Профиль
                  </NavLink>
                </li>
                <li className="header__nav-item">
                  <button className="header__nav-btn" onClick={handleLogout}>
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="header__nav-item">
                  <NavLink
                    to="/register"
                    className="header__nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Зарегистрироваться
                  </NavLink>
                </li>
                <li className="header__nav-item">
                  <NavLink
                    to="/login"
                    className="header__nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Войти
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
