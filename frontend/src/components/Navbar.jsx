import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Palette, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={"/settings"}
              className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-300 bg-base-100/50 border border-base-300/50 hover:bg-primary/10 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(129,140,248,0.15)] backdrop-blur-md"
            >
              <div className="p-1.5 rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Palette className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline text-sm font-semibold tracking-wide text-base-content/90 pr-2">
                Theme
              </span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-300 bg-base-100/50 border border-base-300/50 hover:bg-base-200 hover:border-base-300 hover:shadow-sm"
                >
                  <div className="p-1.5 rounded-full bg-base-200 text-base-content/70 transition-colors duration-300 group-hover:bg-base-300 group-hover:text-base-content">
                    <User className="size-4" />
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold tracking-wide text-base-content/80 pr-2">
                    Profile
                  </span>
                </Link>

                <button
                  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-300 bg-base-100/50 border border-base-300/50 hover:bg-error/10 hover:border-error/30 hover:shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                  onClick={logout}
                >
                  <div className="p-1.5 rounded-full bg-error/10 text-error transition-transform duration-300 group-hover:scale-110">
                    <LogOut className="size-4" />
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold tracking-wide text-error/90 pr-2">
                    Logout
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
