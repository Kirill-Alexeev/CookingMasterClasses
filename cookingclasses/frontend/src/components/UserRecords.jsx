import { useState, useEffect } from "react";
import { getRecords } from "../api/workshops";
import "../styles/components/_user-records.scss"

const UserRecords = () => {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getRecords();
        console.log("Records data:", data);
        setRecords(data);
      } catch (err) {
        console.error("Error fetching records:", err);
        setError("Не удалось загрузить записи");
      }
    };
    fetchRecords();
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!records.length) return <div>Записей на мастер-классы нет</div>;

  return (
    <div className="user-records">
      <h2>Ваши записи на мастер-классы</h2>
      <ul className="user-records__list">
        {records.map((record) => (
          <li key={record.id} className="user-records__item">
            <p>
              <strong>Мастер-класс:</strong> {record.master_class__title}
            </p>
            <p>
              <strong>Статус оплаты:</strong> {record.payment_status}
            </p>
            <p>
              <strong>Дата записи:</strong>{" "}
              {new Date(record.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRecords;
