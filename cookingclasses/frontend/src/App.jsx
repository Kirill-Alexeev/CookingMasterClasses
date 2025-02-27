import { useState, useEffect } from "react";
import { getUserProfile } from "./api/users";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user && <p>Вы вошли как {user.username}</p>}. Имя: {user.first_name},
      Фамилия: {user.last_name}
    </div>
  );
}

export default App;
