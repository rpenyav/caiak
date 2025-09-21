declare const __APP_VERSION__: string;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-light text-center py-3 mt-auto">
      <div className="container">
        <small>{`v${__APP_VERSION__} · ${currentYear}`}</small>
      </div>
    </footer>
  );
};

export default Footer;
