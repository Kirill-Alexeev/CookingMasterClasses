import { useState, useEffect } from "react";
import axios from "axios";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users/kaexam/");
        setExams(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Алексеев Кирилл Игоревич, группа 231-321</h1>
      <h2>Список экзаменов:</h2>

      {exams.map((exam) => (
        <div
          key={exam.id}
          style={{ margin: "20px", padding: "15px", border: "1px solid #ddd" }}
        >
          <h3>{exam.title}</h3>
          <p>
            <strong>Дата создания:</strong>{" "}
            {new Date(exam.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Дата экзамена:</strong>{" "}
            {new Date(exam.exam_date).toLocaleString()}
          </p>
          {exam.image && (
            <img
              src=''
              alt="Задание"
              style={{ maxWidth: "200px" }}
            />
          )}
          <p>
            <strong>Участники:</strong>
            {exam.users.map((user) => user.username).join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ExamsPage;
