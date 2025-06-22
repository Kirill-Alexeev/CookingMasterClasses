import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./pages/MainPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import RestaurantList from "./pages/RestaurantList";
import RestaurantDetail from "./pages/RestaurantDetail";
import ChefDetail from "./pages/ChefDetail";
import MasterClassList from "./pages/MasterClassList";
import MasterClassDetail from "./pages/MasterClassDetail";
import VideoList from "./pages/VideoList";
import VideoDetail from "./pages/VideoDetail";
import RecordMasterClass from "./pages/Record";
import AdminRecords from "./pages/AdminRecords";
import "./styles/components/_skip-link.scss";

function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        Перейти к основному содержимому
      </a>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/restaurant-list" element={<RestaurantList />} />
        <Route path="/restaurant-detail/:id" element={<RestaurantDetail />} />
        <Route path="/chef-detail/:id" element={<ChefDetail />} />
        <Route path="/master-class-list" element={<MasterClassList />} />
        <Route
          path="/master-class-detail/:id"
          element={<MasterClassDetail />}
        />
        <Route path="/video-list" element={<VideoList />} />
        <Route path="/video-detail/:id" element={<VideoDetail />} />
        <Route path="/record" element={<RecordMasterClass />} />
        <Route path="/admin-record" element={<AdminRecords />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
