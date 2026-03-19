import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

type ChangeEventLike = {
  target: {
    value: string;
  };
};

interface StyledSelectProps {
  value: string | number;
  onChange?: (event: ChangeEventLike) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

interface ParsedOption {
  value: string;
  label: string;
  disabled: boolean;
}

const extractText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map((item) => extractText(item)).join("").replace(/\s+/g, " ").trim();
  }
  if (isValidElement(node)) {
    return extractText((node.props as { children?: ReactNode }).children);
  }
  return "";
};

const StyledSelect = ({
  value,
  onChange,
  children,
  disabled = false,
  className = "",
}: StyledSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<Record<string, string>>({});
  const normalizedValue = String(value ?? "");

  const options = useMemo<ParsedOption[]>(() => {
    return Children.toArray(children).flatMap((child) => {
      if (!isValidElement(child)) return [];

      const childProps = child.props as {
        value?: string | number;
        disabled?: boolean;
        children?: ReactNode;
      };

      return [
        {
          value: String(childProps.value ?? ""),
          label: extractText(childProps.children ?? ""),
          disabled: Boolean(childProps.disabled),
        },
      ];
    });
  }, [children]);

  const selectedOption =
    options.find((option) => option.value === normalizedValue) ?? options[0] ?? null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = rootRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const availableHeight = Math.max(180, window.innerHeight - rect.bottom - 20);

      setMenuStyle({
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.min(320, availableHeight)}px`,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const handleSelect = (nextValue: string, optionDisabled: boolean) => {
    if (disabled || optionDisabled) return;
    setOpen(false);
    onChange?.({ target: { value: nextValue } });
  };

  return (
    <div
      ref={rootRef}
      className={`styled-select ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        ref={triggerRef}
        className="styled-select__trigger"
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        disabled={disabled}
      >
        <span className={`styled-select__value ${!selectedOption?.value ? "is-placeholder" : ""}`}>
          {selectedOption?.label || "Selecciona una opcion"}
        </span>
        <ChevronDown size={18} className="styled-select__icon" />
      </button>

      {open
        ? createPortal(
            <div ref={menuRef} className="styled-select__menu" style={menuStyle}>
              {options.map((option) => (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  className={`styled-select__option ${option.value === normalizedValue ? "is-selected" : ""}`}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value, option.disabled)}
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default StyledSelect;
