import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMasterClassDetail } from "../api/workshops";

function MasterClassDetail() {
  const { id } = useParams();
  const [masterClass, setMasterClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMasterClassDetail(id)
      .then((data) => {
        setMasterClass(data);
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
      <h1>{masterClass.title}</h1>
      <p>{masterClass.description}</p>
    </div>
  );
}

export default MasterClassDetail;
