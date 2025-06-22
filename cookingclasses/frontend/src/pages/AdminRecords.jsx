import { useState, useEffect } from "react";
import { getRecords } from "../api/workshops";
import { getCurrentUser } from "../api/users";
import Breadcrumbs from "../components/Breadcrumbs";
import PropTypes from "prop-types";
import { masterClassesApi } from "../api/workshops";

function AdminRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // 4.2: Проверка прав доступа
        const user = await getCurrentUser();
        if (!user?.isAdmin && !user?.isStaff) {
          setError("Доступ запрещён: только для администраторов");
          setLoading(false);
          return;
        }
        const recordsData = await getRecords();
        setRecords(recordsData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Ошибка при загрузке записей");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      await masterClassesApi.updateRecord(recordId, {
        payment_status: newStatus,
      });
      setRecords(
        records.map((record) =>
          record.id === recordId
            ? { ...record, payment_status: newStatus }
            : record
        )
      );
    } catch (err) {
      setError(err.message || "Ошибка при обновлении статуса");
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-records" id="main-content">
      <Breadcrumbs />
      <h1 className="admin-records__title">Управление записями</h1>
      <div className="admin-records__list">
        {records.length === 0 ? (
          <p className="error">Записи отсутствуют</p>
        ) : (
          records.map((record) => (
            <div key={record.id} className="admin-records__item">
              <p className="admin-records__info">
                Пользователь: {record.user?.username || "Не указан"}
              </p>
              <p className="admin-records__info">
                Мастер-класс: {record.master_class__title}
              </p>
              <p className="admin-records__info">Билетов: {record.tickets}</p>
              <p className="admin-records__info">Email: {record.email}</p>
              <p className="admin-records__info">Телефон: {record.phone}</p>
              <p className="admin-records__info">
                Статус: {record.payment_status}
              </p>
              <select
                value={record.payment_status}
                onChange={(e) => handleStatusChange(record.id, e.target.value)}
                className="admin-records__status-select"
              >
                <option value="Ожидание">Ожидание</option>
                <option value="Подтверждено">Подтверждено</option>
                <option value="Отменено">Отменено</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

AdminRecords.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    username: PropTypes.string,
    isAdmin: PropTypes.bool,
    isStaff: PropTypes.bool,
  }),
};

AdminRecords.defaultProps = {
  currentUser: null,
};

export default AdminRecords;
