"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Dropdown, Input, Drawer, Row, Col, theme, Grid } from "antd";
import { TranslationOutlined, CheckOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { LANGUAGES } from "./config";
import { LOCALE_STORAGE_KEY } from "@/app/localeRedirect";

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

  // 只有一种语言就不出这个按钮 —— 单语言构建（build:lang）下它点开只有一个选项，
  // 白占顶栏那点稀缺宽度。这道判断从前由 buildWithLang.js 正则删掉 <LanguageSelector />
  // 实现，那套办法在组件重构时会静默失效；组件自己知道语言集合，判据放这里。
  // 放在所有 hook 之后：提前 return 会打乱 hook 调用顺序。
  if (LANGUAGES.length <= 1) return null;

  const currentLanguage = LANGUAGES.find((l) => l.key === locale)?.label || "English";

  const filteredLanguages = (() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q) || l.key.toLowerCase().includes(q));
  })();

  const handleLanguageChange = (key: string) => {
    // 记住显式选择：裸域名根页的落点脚本优先读它，不再按浏览器偏好猜。没有这一层
    // 的话，用户切到英文、下次打开裸域名又被甩回浏览器语言 —— 站点会跟用户对着干。
    // 无痕模式下 setItem 会抛，吞掉即可（退化成按浏览器偏好）。
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, key);
    } catch {}
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

  // 触发按钮两个分支共用同一份，语言名显不显示交给 CSS（.lang-btn），不交给
  // isMobile —— Grid.useBreakpoint() 在 SSR 返回 {}，用它顶栏每次加载都会抖一下。
  // isMobile 只保留面板形态（Drawer / Dropdown）的选择，那要点开才可见。
  const trigger = (
    <Button className="lang-btn" type="text" icon={<TranslationOutlined />} aria-label={t("language")} onClick={isMobile ? () => setLangOpen(true) : undefined}>
      {currentLanguage}
    </Button>
  );

  return (
    <>
      {isMobile ? (
        <>
          {trigger}
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
          {trigger}
        </Dropdown>
      )}
    </>
  );
}
