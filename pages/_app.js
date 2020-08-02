// In Next.js, you can add global CSS files by importing them from _app.js. You cannot import global CSS anywhere else.
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
