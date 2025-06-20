import { useState, useEffect, useCallback } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import VideoSort from "../components/VideoSort";
import VideoFilter from "../components/VideoFilter";
import likeIcon from "../assets/icons/like.png";
import placehold from "../assets/icons/placeholder_photo.png";
import { getVideos } from "../api/workshops";

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const getFiltersFromURL = useCallback(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      maxDurationSeconds: params.max_duration_seconds || "",
      minLikes: params.min_likes || "",
      minComments: params.min_comments || "",
      sortField: params.sort_field || "title",
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
        const data = await getVideos(filters, page);
        console.log("Videos response:", data);
        setVideos(data.results || []);
        setTotalLikes(data.total_likes || 0);
      } catch (err) {
        console.error("Fetch videos error:", err);
        setError(err.error || `Ошибка загрузки видео: ${JSON.stringify(err)}`);
      } finally {
        setLoading(false);
      }
    },
    [getFiltersFromURL]
  );

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos, searchParams]);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort_field", newSort.field);
    params.set("sort_direction", newSort.direction);
    params.set("page", "1");
    setSearchParams(params);
    fetchVideos();
  };

  const handleFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.maxDurationSeconds)
      params.set("max_duration_seconds", newFilters.maxDurationSeconds);
    if (newFilters.minLikes) params.set("min_likes", newFilters.minLikes);
    if (newFilters.minComments)
      params.set("min_comments", newFilters.minComments);
    if (newFilters.sortField) params.set("sort_field", newFilters.sortField);
    if (newFilters.sortDirection)
      params.set("sort_direction", newFilters.sortDirection);
    params.set("page", "1");
    setSearchParams(params);
    fetchVideos();
  };

  const truncateDescription = (text = "", wordLimit = 10) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const formatDuration = (duration) => {
    if (!duration) return "0с";
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    let result = "";
    if (hours > 0) result += `${hours}ч `;
    if (minutes > 0 || hours > 0) result += `${minutes}мин `;
    if (seconds > 0 || result === "") result += `${seconds}с`;
    return result.trim();
  };

  if (loading) return <div className="video-list__loading">Загрузка...</div>;
  if (error) return <div className="video-list__error">{error}</div>;

  const currentFilters = getFiltersFromURL();

  return (
    <div className="video-list" id="main-content">
      <div className="video-list__wrapper">
        <Breadcrumbs />
        <h1 className="video-list__title">Видеоуроки</h1>
        <div className="video-list__stats">
          Общее количество лайков: {totalLikes}
        </div>
        <div className="video-list__content">
          <div className="video-list__controls">
            <VideoSort
              sort={{
                field: currentFilters.sortField,
                direction: currentFilters.sortDirection,
              }}
              onSortChange={handleSortChange}
              sortOptions={[
                { value: "title", label: "Название" },
                { value: "duration", label: "Длительность" },
                { value: "likes_count", label: "Лайки" },
              ]}
            />
            <VideoFilter
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
            />
          </div>
          <div className="video-catalog">
            <div className="video-catalog__list">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <div key={video.id} className="video-card">
                    <NavLink
                      to={`/video-detail/${video.id}`}
                      state={{ title: video.title }}
                      className="video-card__link"
                    >
                      <div className="video-card__img-wrapper">
                        <img
                          src={placehold}
                          alt={video.title}
                          className="video-card__img"
                          loading="lazy"
                        />
                        {video.is_new && (
                          <span className="video-card__new-badge">Новое</span>
                        )}
                      </div>
                      <div className="video-card__content">
                        <div className="video-card__top">
                          <h3 className="video-card__title">{video.title}</h3>
                          <div className="video-card__rating">
                            <img
                              src={likeIcon}
                              className="video-card__rating-img"
                              alt="Лайки"
                            />
                            {video.actual_likes_count || 0}
                          </div>
                        </div>
                        <p className="video-card__duration">
                          {formatDuration(video.duration)}
                        </p>
                        <p className="video-card__desc">
                          {truncateDescription(video.description)}
                        </p>
                      </div>
                    </NavLink>
                  </div>
                ))
              ) : (
                <div className="video-catalog__empty">
                  Нет доступных видеоуроков. Попробуйте изменить фильтры.
                </div>
              )}
            </div>
            {videos.length > 0 && (
              <div className="pagination">
                <span className="pagination__count">
                  Всего: {videos.length}
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
