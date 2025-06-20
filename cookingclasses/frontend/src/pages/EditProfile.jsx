import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, updateUserProfile } from "../api/users";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    image: null,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setFormData({
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          image: null,
        });
      } catch {
        setError("Не удалось загрузить данные");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await updateUserProfile(data);
      navigate("/profile");
    } catch {
      setError("Не удалось обновить профиль");
    }
  };

  return (
    <div className="edit-profile">
      <h1>Редактировать профиль</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="edit-profile__form">
        <label>
          Логин:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="edit-profile__input"
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="edit-profile__input"
          />
        </label>
        <label>
          Имя:
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="edit-profile__input"
          />
        </label>
        <label>
          Фамилия:
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="edit-profile__input"
          />
        </label>
        <label>
          Фото:
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="edit-profile__input"
          />
        </label>
        <div className="edit-profile__actions">
          <button type="submit" className="edit-profile__button">
            Сохранить
          </button>
          <button
            type="button"
            className="edit-profile__button edit-profile__button--cancel"
            onClick={() => navigate("/profile")}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
