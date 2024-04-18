"use client";
import { useEffect } from "react";

const ClientScripts = () => {
  useEffect(() => {
    // 加载统计脚本
    const piwikScript = document.createElement("script");
    piwikScript.async = true;
    piwikScript.src = "https://piwik.seoipo.com/matomo.js";
    document.body.appendChild(piwikScript);

    var _paq = (window._paq = window._paq || []);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    _paq.push(["setTrackerUrl", "https://piwik.seoipo.com/matomo.php"]);
    _paq.push(["setSiteId", "10"]);
  }, []);

  return null; // 无需渲染任何内容
};

export default ClientScripts;
