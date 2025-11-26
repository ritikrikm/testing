import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../Layout/MainLayout";
import { HomePage } from "../Pages/HomePage";
import { NavProvider } from "../Context/NavContext";

export const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <NavProvider>
            <MainLayout />
          </NavProvider>
        }
      >
        <Route
          index
          element={
            <NavProvider>
              <HomePage />
            </NavProvider>
          }
        />
      </Route>
    </Routes>
  );
};
