import { LogoCaiak } from "../../components";

declare const __APP_VERSION__: string;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer-custom ">
      <div
        className="container  d-flex flex-column "
        style={{ height: "100%" }}
      >
        <div className="row">
          <div className="col-md-3 pt-3">
            <LogoCaiak width={80} />
            <p>
              <small className="mini-text">{`v${__APP_VERSION__} · ${currentYear}`}</small>
            </p>
          </div>

          <div className="col-md-9 pt-4">
            <div className="d-flex justify-content-end gap-5 flex-wrap">
              <div>
                <a href="" className="nav-link-custom">
                  Documentation
                </a>
              </div>
              <div>
                <a href="" className="nav-link-custom">
                  Repository
                </a>
              </div>
              <div>
                <a href="" className="nav-link-custom">
                  Examples
                </a>
              </div>
              <div>
                <a href="" className="nav-link-custom">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
