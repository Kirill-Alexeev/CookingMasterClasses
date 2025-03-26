import { useLocation, Link } from "react-router-dom";

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) {
    return null;
  }

  const crumbs = [];
  let currentPath = "";

  pathnames.forEach((name, index) => {
    currentPath += `/${name}`;
    const isLast = index === pathnames.length - 1;

    const nameMap = {
      "master-class-list": "Мастер-классы",
      "restaurant-list": "Рестораны",
      "video-list": "Видео",
      profile: "Профиль",
      login: "Вход",
      register: "Регистрация",
    };

    const displayName =
      nameMap[name] ||
      name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    crumbs.push({
      path: currentPath,
      name: displayName,
      isLast,
    });
  });

  return (
    <nav className="breadcrumbs">
      <ul className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          <Link to="/" className="breadcrumbs__link">
            Главная
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.path} className="breadcrumbs__item">
            <span className="breadcrumbs__separator">/</span>
            {crumb.isLast ? (
              <span className="breadcrumbs__current">{crumb.name}</span>
            ) : (
              <Link to={crumb.path} className="breadcrumbs__link">
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Breadcrumbs;
