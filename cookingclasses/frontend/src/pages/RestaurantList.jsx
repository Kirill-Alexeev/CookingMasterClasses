import { useState, useEffect } from "react";
import { getRestaurants } from "../api/workshops";

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRestaurants()
      .then((data) => {
        setRestaurants(data);
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
      <h1>Список ресторанов</h1>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>{restaurant.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default RestaurantList;
