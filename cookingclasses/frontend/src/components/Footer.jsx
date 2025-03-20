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
      <div className="footer__wrapper">
        <div className="footer__top">
          <NavLink to="/" className="footer__logo" end>
            <img src={kylinarLogo} alt="Кулинар" className="footer__logo-img" />
          </NavLink>
          <nav className="footer__nav">
            <ul className="footer__nav-list">
              <li className="footer__nav-item">
                <NavLink to="/" className="footer__nav-link" end>
                  Главная
                </NavLink>
              </li>
              <li className="footer__nav-item">
                <NavLink to="/master-class-list" className="footer__nav-link">
                  Мастер-классы
                </NavLink>
              </li>
              <li className="footer__nav-item">
                <NavLink to="/restaurant-list" className="footer__nav-link">
                  Рестораны
                </NavLink>
              </li>
              <li className="footer__nav-item">
                <NavLink to="/video-list" className="footer__nav-link">
                  Видео-уроки
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer__bottom">
          <div className="footer__apps">
            <p className="footer__apps-title">Скачать мобильное приложение:</p>
            <div className="footer__apps-links">
              <a href="#" className="footer__apps-link">
                <img
                  src={googlePlayIcon}
                  alt="Google Play"
                  className="footer__apps-icon"
                />
                Скачать в Google Play
              </a>
              <a href="#" className="footer__apps-link">
                <img
                  src={appStoreIcon}
                  alt="App Store"
                  className="footer__apps-icon"
                />
                Скачать в App Store
              </a>
            </div>
          </div>
          <div className="footer__links">
            <div className="footer__social">
              <a href="#" className="footer__social-link">
                <img
                  src={whatsAppIcon}
                  alt="WhatsApp"
                  className="footer__social-icon"
                />
              </a>
              <a href="#" className="footer__social-link">
                <img src={vkIcon} alt="VK" className="footer__social-icon" />
              </a>
              <a href="#" className="footer__social-link">
                <img
                  src={telegramIcon}
                  alt="Telegram"
                  className="footer__social-icon"
                />
              </a>
            </div>
            <div className="footer__contacts">
              <a
                href="mailto:kylinar@mail.ru"
                className="footer__contacts-link"
              >
                <img src={mailIcon} className="footer__contactsimg" />
                kylinar@mail.ru
              </a>
              <a href="tel:+79500000000" className="footer__contacts-link">
                <img src={phoneIcon} className="footer__contacts-img" />
                +7 (950) 000-00-00
              </a>
            </div>
          </div>
        </div>
        <div className="footer__copyright">
          <p>
            © kylinar.ru, 2024. Все права защищены. Использование материалов
            сайта возможно только с письменного разрешения правообладателя.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
