import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">
            Exposure Link Dashboard
          </a>
        </Link>
      </div>
    </nav>
  );
}
