// import { Shield } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          
          <span className="font-bold text-xl">FlowDroid</span>
        </Link>
        <nav className="ml-auto">
          <ul className="flex gap-6">
            {/* <li>
              <Link href="/" className="text-sm hover:text-primary transition-colors">
                Home
              </Link>
            </li> */}
            <li>
              <Link href="https://github.com/secure-software-engineering/FlowDroid" className="text-sm hover:text-primary transition-colors">
                Documentation
              </Link>
            </li>
            {/* <li>
              <Link href="#" className="text-sm hover:text-primary transition-colors">
                About
              </Link>
            </li> */}
          </ul>
        </nav>
      </div>
    </header>
  )
}

