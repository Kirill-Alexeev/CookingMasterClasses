import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChefDetail } from "../api/workshops";

function ChefDetail() {
  const { id } = useParams();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getChefDetail(id)
      .then((data) => {
        setChef(data);
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
      <h1>{chef.name}</h1>
      <p>{chef.bio || "Биография шеф-повара"}</p>
    </div>
  );
}

export default ChefDetail;
