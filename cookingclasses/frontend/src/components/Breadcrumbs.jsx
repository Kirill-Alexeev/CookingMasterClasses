import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  getNavigationHistory,
  addToNavigationHistory,
} from "../utils/navigationHistory";

function Breadcrumbs() {
  const location = useLocation();
  const [currentMasterClassTitle, setCurrentMasterClassTitle] = useState(null);

  useEffect(() => {
    const pathnames = location.pathname.split("/").filter((x) => x);

    const nameMap = {
      "master-class-list": "Мастер-классы",
      "master-class": "Мастер-класс",
      "master-class-detail": "Мастер-класс",
      "restaurant-list": "Рестораны",
      "video-list": "Видео",
      profile: "Профиль",
      login: "Вход",
      register: "Регистрация",
      record: "Запись на мастер-класс",
      payment: "Оплата",
    };

    const getDisplayName = (pathname, pathnames) => {
      if (!isNaN(pathname) && pathnames.includes("master-class-detail")) {
        const title = location.state?.title || "Мастер-класс";
        setCurrentMasterClassTitle(title);
        return title;
      }

      if (pathname === "record" && pathnames.includes("master-class-detail")) {
        return location.state?.title || "Запись на мастер-класс";
      }

      if (nameMap[pathname]) {
        return nameMap[pathname];
      }

      return pathname
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const currentPath = location.pathname;
    const displayName =
      pathnames.length > 0
        ? getDisplayName(pathnames[pathnames.length - 1], pathnames)
        : "Главная";

    addToNavigationHistory(currentPath, displayName);
  }, [location]);

  const history = getNavigationHistory();

  if (history.length === 0) {
    return null;
  }

  const updatedHistory = history.map((item) => {
    const pathnames = item.path.split("/").filter((x) => x);
    if (
      !isNaN(pathnames[pathnames.length - 1]) &&
      pathnames.includes("master-class-detail") &&
      currentMasterClassTitle
    ) {
      return { ...item, name: currentMasterClassTitle };
    }
    return item;
  });

  return (
    <nav className="breadcrumbs">
      <ul className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          <Link to="/" className="breadcrumbs__link">
            Главная
          </Link>
        </li>
        {updatedHistory.map((item, index) => {
          const isLast = index === updatedHistory.length - 1;
          return (
            <li key={item.path} className="breadcrumbs__item">
              <span className="breadcrumbs__separator">/</span>
              {isLast ? (
                <span className="breadcrumbs__current">{item.name}</span>
              ) : (
                <Link to={item.path} className="breadcrumbs__link">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Breadcrumbs;
