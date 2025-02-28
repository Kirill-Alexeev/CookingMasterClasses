import { useState, useEffect } from "react";
import { getUserProfile } from "../api/users";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setUser(data);
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
      <h1>Профиль</h1>
      {user && <p>Добро пожаловать, {user.username}!</p>}
    </div>
  );
}

export default Profile;
