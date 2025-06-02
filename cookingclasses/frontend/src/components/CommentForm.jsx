import { useState } from "react";
import PropTypes from "prop-types";
import { createComment } from "../api/workshops";

function CommentForm({ videoId, onCommentAdded, currentUser }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = {
        video: parseInt(videoId), // Убедимся, что videoId — число
        text,
        user: currentUser.id,
      };
      const response = await createComment(newComment);
      onCommentAdded(response);
      setText("");
    } catch (err) {
      setError(err.error || "Ошибка при отправке комментария");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-required">
        <p>
          Чтобы оставить комментарий, пожалуйста, <a href="/login">войдите</a>{" "}
          или <a href="/register">зарегистрируйтесь</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <h3 className="comment-form-title">Оставить комментарий</h3>
      <div className="form-group">
        <label htmlFor="comment">Ваш комментарий:</label>
        <textarea
          id="comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          minLength="5"
          className="comment-textarea"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-comment-btn"
      >
        {isSubmitting ? "Отправка..." : "Отправить комментарий"}
      </button>
    </form>
  );
}

CommentForm.propTypes = {
  videoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCommentAdded: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
  }),
};

CommentForm.defaultProps = {
  currentUser: null,
};

export default CommentForm;
