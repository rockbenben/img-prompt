import React, { FC, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Image as AntdImage, Tooltip } from "antd";
import { TagItem } from "./types";

// 仅纯触屏（无 hover）才走移动端分支，避开带触屏的笔记本误判。
// 媒体查询是外部 store，useSyncExternalStore 是正解（SSR 快照 = false）
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";
const subscribeTouch = (callback: () => void) => {
  const mql = window.matchMedia(TOUCH_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
};
const useTouchOnly = () =>
  useSyncExternalStore(
    subscribeTouch,
    () => window.matchMedia(TOUCH_QUERY).matches,
    () => false,
  );

const TooltipBody: FC<{ tag: TagItem; onPreviewOpenChange: (v: boolean) => void }> = ({ tag, onPreviewOpenChange }) => {
  const showLangName = tag.langName && tag.langName !== tag.displayName;
  return (
    <div className="text-center">
      {showLangName && <p className="text-sm font-medium mb-1">{tag.langName}</p>}
      {tag.preview && (
        <AntdImage
          src={tag.preview}
          alt={tag.displayName}
          width={200}
          className="rounded mb-2"
          preview={{ mask: "🔍", onOpenChange: onPreviewOpenChange }}
        />
      )}
      {tag.description && <p className="text-sm">{tag.description}</p>}
    </div>
  );
};

interface Props {
  tag: TagItem;
  children: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}

// 桌面：hover Tooltip + 点击图片放大；触屏：长按打开同样的 Tooltip 浮层（含 langName/图片/description），外部点击关闭
const TagTooltipWrapper: FC<Props> = ({ tag, children }) => {
  const touchOnly = useTouchOnly();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  // 触屏端：浮层开启时，外部点击关闭；点击 tooltip / 大图 lightbox 内不关闭
  useEffect(() => {
    if (!touchOnly || !tooltipOpen) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (target.closest(".ant-tooltip")) return;
      if (target.closest(".ant-image-preview-root")) return;
      setTooltipOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [touchOnly, tooltipOpen]);

  if (touchOnly) {
    const startLongPress = () => {
      longPressedRef.current = false;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      longPressTimer.current = setTimeout(() => {
        longPressedRef.current = true;
        setTooltipOpen(true);
      }, 450);
    };
    const cancelLongPress = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };
    const onClickCapture = (e: React.MouseEvent) => {
      if (longPressedRef.current) {
        // 长按刚触发：吃掉随后的 click，浮层保持打开
        e.preventDefault();
        e.stopPropagation();
        longPressedRef.current = false;
        return;
      }
      if (tooltipOpen) {
        // 已打开时再点：关闭浮层，不选中
        e.preventDefault();
        e.stopPropagation();
        setTooltipOpen(false);
      }
    };

    const childStyle = (children.props.style ?? {}) as React.CSSProperties;
    const enhanced = React.cloneElement(children, {
      onPointerDown: startLongPress,
      onPointerUp: cancelLongPress,
      onPointerLeave: cancelLongPress,
      onPointerCancel: cancelLongPress,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      onClickCapture,
      style: {
        ...childStyle,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        touchAction: "manipulation",
      },
    });

    // 触屏：关 lightbox 时一并收掉 Tooltip，避免预览结束后浮层凭空复显
    const handlePreviewOpenChangeTouch = (open: boolean) => {
      setPreviewOpen(open);
      if (!open) setTooltipOpen(false);
    };

    return (
      <span ref={wrapperRef} style={{ display: "inline-flex" }}>
        <Tooltip
          title={<TooltipBody tag={tag} onPreviewOpenChange={handlePreviewOpenChangeTouch} />}
          placement="top"
          trigger={[]}
          open={tooltipOpen && !previewOpen}>
          {enhanced}
        </Tooltip>
      </span>
    );
  }

  return (
    <Tooltip title={<TooltipBody tag={tag} onPreviewOpenChange={setPreviewOpen} />} placement="top" open={previewOpen ? false : undefined}>
      {children}
    </Tooltip>
  );
};

export default TagTooltipWrapper;
