import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__logo">
          <img src="/logo.png" alt="Кулинар" className="footer__logo-img" />
        </div>
        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <NavLink to="/" className="header__nav-link" end>
                Главная
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink to="/master-class-list" className="header__nav-link">
                Мастер-классы
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink to="/restaurant-list" className="header__nav-link">
                Рестораны
              </NavLink>
            </li>
            <li className="header__nav-item">
              <NavLink to="/video-list" className="header__nav-link">
                Видео
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="footer__bottom">
        <div className="footer__social">
          <a href="https://wa.me/79500002010" className="footer__social-link">
            <img src="#" alt="WhatsApp" className="footer__social-icon" />
          </a>
          <a href="https://vk.com/kylinar" className="footer__social-link">
            <img src="#" alt="VK" className="footer__social-icon" />
          </a>
          <a href="https://t.me/kylinar" className="footer__social-link">
            <img src="#" alt="Telegram" className="footer__social-icon" />
          </a>
        </div>
        <div className="footer__contacts">
          <p className="footer__contact-email">kylinar@mail.ru</p>
          <p className="footer__contact-phone">+7 (950) 000-20-10</p>
        </div>
        <div className="footer__apps">
          <a href="#" className="footer__app-link">
            <img src="#" alt="Google Play" className="footer__app-icon" />
          </a>
          <a href="#" className="footer__app-link">
            <img src="#" alt="App Store" className="footer__app-icon" />
          </a>
        </div>
      </div>
      <div className="footer__copyright">
        <p>
          © kylinar.ru, 2024. Все права защищены. Использование материалов сайта
          возможно только с письменного разрешения правообладателя.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
