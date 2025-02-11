import {
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { Button, Card } from 'antd';
import WebVitalsMonitor from "../components/Webvital";


import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
      <div style={{ padding: '20px' }}>
    <Card title="Welcome to Ant Design" bordered={true}>
      <Button type="primary">Click Me!</Button>
    </Card>
    <WebVitalsMonitor/>
  </div>
      </Layout>
    </Page>
  );
}
