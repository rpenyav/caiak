import { useAuth } from "@/auth";
import { LogoCaiak, IconLogout } from "../../components";

const Header = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header-custom">
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="part1">
          <div className="ms-2">
            <LogoCaiak />
          </div>
          <div className="divider-left-white"></div>
          <div>
            <div className="text-block-dark">
              conversation artificial inteligence
            </div>
            <div className="text-block-dark">adaptable knowledge</div>
          </div>
        </div>
        <div className="part2">
          <button
            className="headers-button"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <IconLogout
              width={20}
              height={20}
              color="#ffffff"
              hoverColor="#d4a017"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
