import { useState } from "react";
import PropTypes from "prop-types";
import { updateComment, deleteComment } from "../api/workshops";

function CommentItem({ comment, onDelete, onUpdate, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  // Отладка: логируем данные для проверки
  console.log("CommentItem props:", {
    commentId: comment.id,
    commentUserId: comment.user.id,
    commentUser: comment.user,
    currentUser: currentUser,
  });

  // Приводим id к числу и проверяем isAdmin или is_staff
  const canEdit =
    currentUser &&
    (parseInt(currentUser.id) === parseInt(comment.user.id) ||
      currentUser.isAdmin === true ||
      currentUser.is_staff === true);

  console.log(
    "canEdit:",
    canEdit,
    "isAdmin:",
    currentUser?.isAdmin,
    "is_staff:",
    currentUser?.is_staff
  );

  const handleUpdate = async () => {
    try {
      const updatedComment = await updateComment(comment.id, {
        text: editedText,
      });
      onUpdate(comment.id, updatedComment.text);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при обновлении комментария:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch (error) {
      console.error("Ошибка при удалении комментария:", error);
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-user">
          <img
            src={comment.user.avatar || "/default-avatar.png"}
            alt={comment.user.username}
            className="comment-avatar"
          />
          <span className="comment-username">{comment.user.username}</span>
        </div>
        <div className="comment-date">
          {new Date(comment.created_at).toLocaleDateString("ru-RU")}
        </div>
      </div>

      {isEditing ? (
        <div className="edit-comment">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="comment-edit-textarea"
          />
          <div className="comment-edit-actions">
            <button onClick={handleUpdate} className="btn-save">
              Сохранить
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-cancel">
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="comment-text">{comment.text}</p>
          {canEdit && (
            <div className="comment-actions">
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Редактировать
              </button>
              <button onClick={handleDelete} className="btn-delete">
                Удалить
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    text: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
    is_staff: PropTypes.bool,
  }),
};

CommentItem.defaultProps = {
  currentUser: null,
};

export default CommentItem;
