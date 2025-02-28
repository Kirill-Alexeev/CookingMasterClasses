import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantDetail } from "../api/workshops";

function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRestaurantDetail(id)
      .then((data) => {
        setRestaurant(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.description || "Описание ресторана"}</p>
    </div>
  );
}

export default RestaurantDetail;
