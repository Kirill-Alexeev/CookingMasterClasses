import { useState, useEffect } from "react";
import { getRestaurants, createRestaurant } from "../api/workshops";
import { getCurrentUser } from "../api/users";
import { Link, useNavigate } from "react-router-dom";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    opening_hours: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user.is_staff);
        const data = await getRestaurants();
        setRestaurants(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await createRestaurant(newRestaurant);
      setRestaurants([...restaurants, response]);
      setNewRestaurant({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        opening_hours: "",
      });
      navigate(`/restaurant-detail/${response.id}`);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert(error.error || "Ошибка при создании ресторана");
    }
  };

  const truncateDescription = (text = "", wordLimit = 10) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  return (
    <div className="restaurant-list" id="main-content">
      <h2 className="restaurant-list-title">Рестораны</h2>

      {isAdmin ? (
        <form
          onSubmit={handleCreateRestaurant}
          className="create-restaurant-form"
        >
          <h3>Добавить ресторан</h3>
          <input
            type="text"
            placeholder="Название"
            value={newRestaurant.name}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, name: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Описание"
            value={newRestaurant.description}
            onChange={(e) =>
              setNewRestaurant({
                ...newRestaurant,
                description: e.target.value,
              })
            }
            required
          />
          <input
            type="text"
            placeholder="Адрес"
            value={newRestaurant.address}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, address: e.target.value })
            }
            required
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={newRestaurant.phone}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, phone: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={newRestaurant.email}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, email: e.target.value })
            }
          />
          <input
            type="url"
            placeholder="Веб-сайт"
            value={newRestaurant.website}
            onChange={(e) =>
              setNewRestaurant({ ...newRestaurant, website: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Часы работы"
            value={newRestaurant.opening_hours}
            onChange={(e) =>
              setNewRestaurant({
                ...newRestaurant,
                opening_hours: e.target.value,
              })
            }
          />
          <button type="submit">Создать</button>
        </form>
      ) : null}

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <Link
                to={`/restaurant-detail/${restaurant.id}`}
                className="restaurant-link"
              >
                {restaurant.first_image ? (
                  <img
                    src={restaurant.first_image}
                    alt={restaurant.name}
                    className="restaurant-image"
                  />
                ) : (
                  <div className="no-image">Нет фото</div>
                )}
                <h3>{restaurant.name}</h3>
              </Link>
              <p>{truncateDescription(restaurant.description, 20)}</p>
              <p>
                <strong>Адрес:</strong> {restaurant.address}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
