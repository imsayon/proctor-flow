import { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon, Leaf } from "lucide-react";

const ThemeContext = createContext(null);
const THEMES = [
  { id: "light", label: "Daylight", icon: Sun },
  { id: "midnight", label: "Midnight", icon: Moon },
  { id: "sage", label: "Sage", icon: Leaf },
];
function savedTheme() {
  try {
    const value = localStorage.getItem("invigra-theme");
    return THEMES.some((item) => item.id === value) ? value : "light";
  } catch {
    return "light";
  }
}
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(savedTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "midnight" ? "dark" : "light";
    try { localStorage.setItem("invigra-theme", theme); } catch { /* storage can be disabled */ }
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
export function ThemeSwitcher({ compact = false }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="invigra-theme-picker" role="group" aria-label="Color theme">
      {THEMES.map(({ id, label, icon: Icon }) => (
        <button type="button" key={id} onClick={() => setTheme(id)}
          aria-label={label + " theme"} aria-pressed={theme === id}
          title={label} className={"invigra-theme-option" + (theme === id ? " active" : "")}>
          <Icon size={15} strokeWidth={1.9} />
          {!compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}