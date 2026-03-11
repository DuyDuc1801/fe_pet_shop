import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {Layout,ConfigProvider,theme} from "antd";
import Header from "../../../components/Client/Header";
import Footer from "../../../components/Client/Footer";

const { Content } = Layout;
const PRIMARY      = "#f97316";
const PRIMARY_DARK = "#ea6c0a";

export default function LayoutDefault() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: PRIMARY,
          colorLink: PRIMARY,
          colorLinkHover: PRIMARY_DARK,
          borderRadius: 10,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#fafafa" }}>
        <Header />
        <Content>
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
}