import { useState, useEffect } from "react";
import { getMasterClasses } from "../api/workshops";

function MainPage() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMasterClasses()
      .then((data) => {
        setMasterClasses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Главная страница</h1>
      <p>Добро пожаловать! Вот несколько мастер-классов:</p>
      <ul>
        {masterClasses.slice(0, 3).map((mc) => (
          <li key={mc.id}>{mc.title}</li> // Показываем первые 3
        ))}
      </ul>
    </div>
  );
}

export default MainPage;
