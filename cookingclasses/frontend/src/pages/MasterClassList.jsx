import { useState, useEffect } from "react";
import { getMasterClasses } from "../api/workshops";

function MasterClassList() {
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
      <h1>Мастер-классы</h1>
      <ul>
        {masterClasses.map((mc) => (
          <li key={mc.id}>{mc.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default MasterClassList;
