import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

function App() {
  const [masterClasses, setMasterClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/workshops/chefs/")
      .then((response) => {
        setMasterClasses(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load master classes");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Chefs</h1>
      <ul>
        {masterClasses.map((chef) => (
          <li key={chef.id}>
            {chef.first_name} {chef.last_name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
