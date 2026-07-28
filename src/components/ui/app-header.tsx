import { ChevronLeft, LogOut } from "lucide-react"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

// --- Interface dan Helpers ---

interface AppHeaderProps {
  title?: string
  subtitle?: string
  backTo?: string
}

// PERBAIKAN 1: Sesuaikan interface dengan respons API yang sebenarnya
interface UserData {
  email: string;
  // Anda bisa menambahkan field lain yang Anda butuhkan di sini (misalnya id, role)
}
interface UserProfileResponse {
  user: UserData;
  message: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0) {
    return "GU";
  }

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
};

// --- Komponen Utama ---

export function AppHeader({
  title = "Halaman",
  subtitle,
  backTo,
}: AppHeaderProps) {

  const [currentUserName, setCurrentUserName] = useState("Pengguna");
  const [currentInitials, setCurrentInitials] = useState("GU");
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`Gagal mengambil profil (${response.status}). Respons Backend Error:`, errorText.substring(0, 100) + '...');

          if (response.status === 401 || response.status === 403) {
            logger.warn("Token ditolak (Unauthorized/Forbidden). Memaksa logout.");
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
          }

          throw new Error(`Gagal mengambil profil pengguna: Status ${response.status}`);
        }

        // Catatan: Mengganti UserProfile ke UserProfileResponse
        const data: UserProfileResponse = await response.json();

        logger.log(" Data Profil berhasil diterima:", data);

        // PERBAIKAN 2: Ambil email dengan aman menggunakan optional chaining
        const username = data?.user?.email || (data as any)?.email || (data as any)?.name || "Pengguna";
        const initials = getInitials(username);

        setCurrentUserName(username);
        setCurrentInitials(initials);
      } catch (error) {
        logger.error("Kesalahan saat mengambil profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-3">
        {backTo && (
          <Link
            to={backTo}
            className="text-muted-foreground hover:text-primary transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="font-serif font-bold text-lg">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-regular">{subtitle}</p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback>{currentInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{currentUserName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/login"
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
