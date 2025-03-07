import { NavLink } from "react-router-dom";
import kylinarLogo from "../assets/icons/kylinar_logo.svg";
import mailIcon from "../assets/icons/mail_icon.svg";
import phoneIcon from "../assets/icons/phone_icon.svg";
import whatsAppIcon from "../assets/icons/whatsapp_icon.svg";
import vkIcon from "../assets/icons/vk_icon.svg";
import telegramIcon from "../assets/icons/telegram_icon.svg";
import googlePlayIcon from "../assets/icons/google_play_icon.svg";
import appStoreIcon from "../assets/icons/app_store_icon.svg";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__logo">
          <img src={kylinarLogo} alt="Кулинар" className="footer__logo-img" />
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
            <img
              src={whatsAppIcon}
              alt="WhatsApp"
              className="footer__social-icon"
            />
          </a>
          <a href="https://vk.com/kylinar" className="footer__social-link">
            <img src={vkIcon} alt="VK" className="footer__social-icon" />
          </a>
          <a href="https://t.me/kylinar" className="footer__social-link">
            <img
              src={telegramIcon}
              alt="Telegram"
              className="footer__social-icon"
            />
          </a>
        </div>
        <div className="footer__contacts">
          <div className="footer__contact-email">
            <img src={mailIcon} className="footer__contact-img" />
            kylinar@mail.ru
          </div>
          <div className="footer__contact-phone">
            <img src={phoneIcon} className="footer__contact-img" />
            +7 (950) 000-20-10
          </div>
        </div>
        <div className="footer__apps">
          <a href="#" className="footer__app-link">
            <img
              src={googlePlayIcon}
              alt="Google Play"
              className="footer__app-icon"
            />
          </a>
          <a href="#" className="footer__app-link">
            <img
              src={appStoreIcon}
              alt="App Store"
              className="footer__app-icon"
            />
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
