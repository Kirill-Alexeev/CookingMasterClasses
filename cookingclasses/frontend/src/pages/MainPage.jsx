import TopMasterClasses from "../components/TopMasterClasses";
import PopularVideos from "../components/PopularVideos";
import TopChefs from "../components/TopChefs";

const MainPage = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Добро пожаловать в мир кулинарных мастер-классов</h1>
        <p>
          Откройте для себя лучшие кулинарные мастер-классы, видеоуроки и
          шеф-поваров
        </p>
      </header>

      <div className="widgets-container">
        <TopMasterClasses />
        <PopularVideos />
        <TopChefs />
      </div>
    </div>
  );
};

export default MainPage;
