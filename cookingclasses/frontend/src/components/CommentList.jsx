import PropTypes from "prop-types";
import CommentItem from "./CommentItem";

function CommentList({ comments, onDelete, onUpdate, currentUser }) {
  return (
    <div className="comment-list">
      <h3 className="comment-list-title">Комментарии ({comments.length})</h3>

      {comments.length === 0 ? (
        <p className="no-comments">Пока нет комментариев. Будьте первым!</p>
      ) : (
        <div className="comments-container">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={onDelete}
              onUpdate={onUpdate}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}

CommentList.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        username: PropTypes.string.isRequired,
      }).isRequired,
      text: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool,
  }),
};

CommentList.defaultProps = {
  currentUser: null,
};

export default CommentList;
