import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex overflow-hidden bg-[#f5f1eb]">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2088&auto=format&fit=crop"
            alt="Diverse Content Team"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#d4c5b9]/40 to-[#9b8b7e]/40 z-10" />
        </div>
        
        {/* Minimal Logo */}
        <div className="relative z-20 p-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#9b8b7e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">سیستم KPI</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f5f1eb]">
        <div className="w-full max-w-md">
          {/* Close button - top right */}
          <div className="flex justify-end mb-8">
            <button className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-sm">
              <svg className="w-5 h-5 text-[#6b5d54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#3d3530] mb-2">
              خوش آمدید
            </h1>
            <p className="text-[#8a7a6f] text-lg">
              برای ادامه وارد شوید
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
