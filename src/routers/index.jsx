import LayoutDefault from "../layouts/Client/LayoutDefault";
import Home from "../pages/Client/Home";
import LoginPage from "../pages/Client/Login";

export const routers = [
  {
    path: "/",
    element: <LayoutDefault/>,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path: "login",
        element: <LoginPage/>
      }
    ]
  },   
  {
    path: "*",
    element: <h2>404 Not found</h2>
  }
];