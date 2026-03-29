import { createContext, useContext, useEffect, type ReactNode } from "react";
import { getTheme, DEFAULT_THEME_ID, type Theme, type ThemeId } from "./themes";

const ThemeContext = createContext<Theme>(getTheme(DEFAULT_THEME_ID));

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

type Props = {
  themeId: ThemeId | string | null;
  children: ReactNode;
};

export function ThemeProvider({ themeId, children }: Props) {
  const theme = getTheme(themeId);

  useEffect(() => {
    document.body.style.background = theme.vars["--color-bg"];
    return () => { document.body.style.background = ""; };
  }, [theme.vars]);

  const cssVars = theme.vars as Record<string, string>;

  return (
    <ThemeContext.Provider value={theme}>
      <div style={cssVars as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
