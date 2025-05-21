import { useState, useEffect, useCallback } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import VideoSort from "../components/VideoSort";
import VideoFilter from "../components/VideoFilter";
import raitingStarIcon from "../assets/icons/raiting_star_icon.svg";
import { getVideos, getFilteredVideos } from "../api/workshops";

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
  });
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const getFiltersFromURL = useCallback(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      maxDuration: params.max_duration || "",
      recentDays: params.recent_days || "",
      username: params.username || "",
      commentText: params.comment_text || "",
      sortField: params.sort_field || "created_at",
      sortDirection: params.sort_direction || "desc",
    };
  }, [searchParams]);

  const fetchVideos = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const filters = getFiltersFromURL();
        console.log("Fetching with filters:", filters, "Page:", page);
        if (isFiltered) {
          const data = await getFilteredVideos(filters, page);
          console.log("Filtered videos response:", data);
          setVideos(data.results || []);
          setPagination({
            next: data.next,
            previous: data.previous,
            count: data.count || 0,
          });
        } else {
          const data = await getVideos();
          console.log("All videos response:", data);
          setVideos(data || []);
          setPagination({
            next: null,
            previous: null,
            count: data.length || 0,
          });
        }
      } catch (err) {
        console.error("Fetch videos error:", err);
        setError(
          err.error ||
            `Ошибка загрузки видео: ${err.message || "Неизвестная ошибка"}`
        );
      } finally {
        setLoading(false);
      }
    },
    [getFiltersFromURL, isFiltered]
  );

  useEffect(() => {
    const hasFilters = Array.from(searchParams.keys()).some((key) =>
      [
        "max_duration",
        "recent_days",
        "username",
        "comment_text",
        "sort_field",
        "sort_direction",
      ].includes(key)
    );
    setIsFiltered(hasFilters);
    fetchVideos();
  }, [fetchVideos, searchParams]);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_field", newSort.field);
    params.set("sort_direction", newSort.direction);
    setSearchParams(params);
    setIsFiltered(true);
    fetchVideos();
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.maxDuration)
      params.set("max_duration", newFilters.maxDuration);
    if (newFilters.recentDays) params.set("recent_days", newFilters.recentDays);
    if (newFilters.username) params.set("username", newFilters.username);
    if (newFilters.commentText)
      params.set("comment_text", newFilters.commentText);
    // Сохраняем параметры сортировки
    if (newFilters.sortField) params.set("sort_field", newFilters.sortField);
    if (newFilters.sortDirection)
      params.set("sort_direction", newFilters.sortDirection);
    setSearchParams(params);
    setIsFiltered(!!params.toString());
    fetchVideos();
  };

  const handlePageChange = (page) => {
    if (page && isFiltered) {
      fetchVideos(page);
    }
  };

  const truncateDescription = (text = "", wordLimit = 10) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const formatDuration = (duration) => {
    if (!duration) return "0мин";
    const [hours, minutes] = duration.split(":");
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    return `${h > 0 ? h + "ч " : ""}${m}мин`;
  };

  if (loading) return <div className="video-list__loading">Загрузка...</div>;
  if (error) return <div className="video-list__error">{error}</div>;

  const currentFilters = getFiltersFromURL();

  return (
    <div className="video-list">
      <div className="video-list__wrapper">
        <Breadcrumbs />
        <h1 className="video-list__title">Видеоуроки</h1>
        <div className="video-list__content">
          <div className="video-list__controls">
            <VideoSort
              sort={{
                field: currentFilters.sortField,
                direction: currentFilters.sortDirection,
              }}
              onSortChange={handleSortChange}
            />
            <VideoFilter
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
            />
          </div>
          <div className="catalog">
            <div className="catalog__list">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <div key={video.id} className="card">
                    <NavLink
                      to={`/video-detail/${video.id}`}
                      state={{ title: video.title }}
                      className="card__link"
                    >
                      <div className="card__img-wrapper">
                        <img
                          src={video.video ? video.video : "/placeholder.jpg"}
                          alt={video.title}
                          className="card__img"
                        />
                      </div>
                      <div className="card__content">
                        <div className="card__top">
                          <h3 className="card__title">{video.title}</h3>
                          <div className="card__rating">
                            <img
                              src={raitingStarIcon}
                              className="card__rating-img"
                              alt="Лайки"
                            />
                            {video.likes_count || 0}
                          </div>
                        </div>
                        <p className="card__duration">
                          {formatDuration(video.duration)}
                        </p>
                        <p className="card__desc">
                          {truncateDescription(video.description)}
                        </p>
                        <button className="card__button">Смотреть</button>
                      </div>
                    </NavLink>
                  </div>
                ))
              ) : (
                <div className="catalog__empty">
                  Нет доступных видеоуроков. Попробуйте изменить фильтры.
                </div>
              )}
            </div>
            {pagination.count > 0 && isFiltered && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.previous)}
                  disabled={!pagination.previous}
                  className="pagination__button"
                >
                  Предыдущая
                </button>
                <button
                  onClick={() => handlePageChange(pagination.next)}
                  disabled={!pagination.next}
                  className="pagination__button"
                >
                  Следующая
                </button>
                <span className="pagination__count">
                  Всего: {pagination.count}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoList;
