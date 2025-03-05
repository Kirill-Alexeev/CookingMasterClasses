import { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../api/users";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setImage(null);
    } catch (err) {
      setError(err.error || "Ошибка загрузки фото");
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Профиль</h1>
      {user && (
        <div>
          <p>Имя: {user.first_name}</p>
          <p>Фамилия: {user.last_name}</p>
          <p>Логин: {user.username}</p>
          <p>Email: {user.email}</p>
          <div>
            <h3>Фото профиля</h3>
            <img
              src={user.image || "https://via.placeholder.com/150"}
              alt="Profile"
              style={{ width: "150px", height: "150px" }}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && (
              <button onClick={handleImageUpload}>Загрузить фото</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
