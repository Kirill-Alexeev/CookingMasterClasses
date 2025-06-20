import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, deleteUserProfile } from "../api/users";
import UserRecords from "../components/UserRecords";
import UserReviewsCommentsLikes from "../components/UserReviewsCommentsLikes";
import "../styles/pages/_profile.scss";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        setError("Не удалось загрузить профиль");
      }
    };
    fetchUser();
  }, []);

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить профиль?")) {
      try {
        await deleteUserProfile();
        navigate("/");
      } catch {
        setError("Не удалось удалить профиль");
      }
    }
  };

  if (!user) return <div>Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile" id="main-content">
      <h1>Профиль пользователя</h1>
      <div className="profile__info">
        {user.image && (
          <img src={user.image} alt="Фото профиля" className="profile__image" />
        )}
        <p>
          <strong>Логин:</strong> {user.username}
        </p>
        <p>
          <strong>Имя:</strong> {user.first_name}
        </p>
        <p>
          <strong>Фамилия:</strong> {user.last_name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Дата регистрации:</strong>{" "}
          {new Date(user.date_joined).toLocaleDateString()}
        </p>
        <div className="profile__actions">
          <button className="profile__button" onClick={handleEdit}>
            Редактировать
          </button>
          <button
            className="profile__button profile__button--delete"
            onClick={handleDelete}
          >
            Удалить профиль
          </button>
        </div>
      </div>
      <UserRecords />
      <UserReviewsCommentsLikes />
    </div>
  );
};

export default Profile;
