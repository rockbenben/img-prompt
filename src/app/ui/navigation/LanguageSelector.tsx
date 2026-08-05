"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Dropdown, Input, Drawer, Row, Col, theme, Grid } from "antd";
import { TranslationOutlined, CheckOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { LANGUAGES } from "./config";

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Nav");
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState("");

  const currentLanguage = LANGUAGES.find((l) => l.key === locale)?.label || "English";

  const filteredLanguages = (() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q) || l.key.toLowerCase().includes(q));
  })();

  const handleLanguageChange = (key: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}(-[a-z]+)?/, `/${key}`);
    // 带上 hash：分类位置以索引存储（locale 无关），切换语言后停在同一分类
    router.push(newPath + window.location.hash);
  };

  const renderLanguageList = () => (
    <>
      <Input
        allowClear
        aria-label={t("languageSearch")}
        // 面板打开后，18 个语言按钮本身就以各自母语命名（中文 / العربية / 日本語…），
        // 认读靠那份列表，不靠搜索框里塞三种语言的提示
        placeholder={t("languageSearch")}
        prefix={<TranslationOutlined />}
        value={langQuery}
        autoFocus={isMobile ? false : langOpen}
        onChange={(e) => setLangQuery(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <div style={{ maxHeight: isMobile ? "60vh" : 360, overflowY: "auto", overflowX: "hidden", paddingBottom: 4 }}>
        <Row gutter={[8, 8]}>
          {filteredLanguages.map((lang) => {
            const selected = lang.key === locale;
            return (
              <Col xs={24} sm={12} md={8} key={lang.key}>
                <Button
                  block
                  size={isMobile ? "middle" : "small"}
                  type={selected ? "primary" : "text"}
                  style={{ justifyContent: "space-between", display: "flex", width: "100%", textAlign: "left" }}
                  onClick={() => {
                    handleLanguageChange(lang.key);
                    setLangOpen(false);
                  }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lang.label}
                    <span style={{ opacity: 0.7, marginLeft: 6 }}>({lang.key})</span>
                  </span>
                  {selected && <CheckOutlined />}
                </Button>
              </Col>
            );
          })}
        </Row>
        {filteredLanguages.length === 0 && <div style={{ padding: 8, opacity: 0.45 }}>{t("languageEmpty")}</div>}
      </div>
    </>
  );

  const desktopPanel = (
    <div
      className="pp-lang-panel"
      style={{
        width: 600,
        maxWidth: "90vw",
        padding: 16,
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
      }}>
      {renderLanguageList()}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Button type="text" icon={<TranslationOutlined />} aria-label={t("language")} onClick={() => setLangOpen(true)} />
          <Drawer title={t("language")} placement="bottom" onClose={() => setLangOpen(false)} open={langOpen} styles={{ body: { padding: 16 } }}>
            {renderLanguageList()}
          </Drawer>
        </>
      ) : (
        <Dropdown
          open={langOpen}
          onOpenChange={setLangOpen}
          trigger={["click"]}
          destroyOnHidden
          arrow={{ pointAtCenter: true }}
          menu={{ items: [] }}
          popupRender={() => desktopPanel}
          placement="bottomRight">
          <Button type="text" icon={<TranslationOutlined />} aria-label={t("language")}>
            {currentLanguage}
          </Button>
        </Dropdown>
      )}
    </>
  );
}
