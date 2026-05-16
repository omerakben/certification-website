const themeBootstrap = `(() => {
  try {
    var stored = localStorage.getItem('theme');
    var theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();`;

export default function ThemeScript() {
  // Static, build-time string injected into <head> to set theme before first paint.
  return <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />;
}
