"use client";

import { cloneElement, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { Avatar, Button, Dropdown } from "antd";
import { DownOutlined, ExportOutlined } from "@ant-design/icons";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeToHover(onChange: () => void) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

type ToolLink = { key: string; icon?: ReactNode; label: ReactElement<ComponentProps<"a">> };

export function ToolsDropdown({ label, items }: { label: string; items: ToolLink[] }) {
  const [openMode, setOpenMode] = useState<"pointer" | "keyboard" | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const keyboardActivation = useRef(false);
  const id = useId();
  const supportsHover = useSyncExternalStore(subscribeToHover, () => window.matchMedia(HOVER_QUERY).matches, () => false);

  useEffect(() => {
    if (!openMode) return;
    const close = () => setOpenMode(null);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [openMode]);

  const focusPanel = useCallback((panel: HTMLUListElement | null) => {
    if (openMode === "keyboard") panel?.querySelector("a")?.focus({ preventScroll: true });
  }, [openMode]);

  function closeAndFocusTrigger() {
    setOpenMode(null);
    triggerRef.current?.focus();
  }

  return (
    <Dropdown
      open={openMode !== null}
      trigger={supportsHover && openMode !== "keyboard" ? ["hover", "click"] : ["click"]}
      mouseEnterDelay={0.25}
      mouseLeaveDelay={0.2}
      destroyOnHidden
      onOpenChange={(open) => {
        const byKeyboard = keyboardActivation.current;
        keyboardActivation.current = false;
        setOpenMode((current) => {
          if (byKeyboard && current !== "keyboard") return "keyboard";
          return open ? current ?? "pointer" : null;
        });
      }}
      popupRender={() => (
        <ul
          ref={focusPanel}
          id={id}
          className="pp-tools-dropdown"
          data-wide={items.length >= 5 || undefined}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              closeAndFocusTrigger();
            }
            if (event.key === "Tab") {
              event.stopPropagation();
              const links = event.currentTarget.querySelectorAll("a");
              if (event.target === (event.shiftKey ? links[0] : links[links.length - 1])) closeAndFocusTrigger();
            }
          }}>
          {items.map(({ key, icon, label: link }) => (
            <li key={key}>
              {cloneElement(link, {
                className: "pp-tools-link",
                tabIndex: openMode === "keyboard" ? undefined : -1,
                onClick: () => {
                  if (openMode === "keyboard") closeAndFocusTrigger();
                  else setOpenMode(null);
                },
              },
              <Avatar aria-hidden="true" shape="square" size={32} icon={icon} />,
              <span>{link.props.children}</span>,
              <ExportOutlined aria-hidden="true" className="pp-tools-external" />)}
            </li>
          ))}
        </ul>
      )}>
      <Button
        ref={triggerRef}
        className="pp-nav-group"
        type="text"
        icon={<DownOutlined aria-hidden="true" />}
        iconPlacement="end"
        aria-controls={openMode ? id : undefined}
        aria-expanded={openMode !== null}
        onClickCapture={(event) => { keyboardActivation.current = event.detail === 0; }}>
        {label}
      </Button>
    </Dropdown>
  );
}
