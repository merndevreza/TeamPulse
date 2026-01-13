'use client'
import useSignout from '@/hooks/useSignout';
import Image from 'next/image' 

const LogoutButton = () => {
  const { isLoading, handleLogoutClick } = useSignout();
  return (
    <button 
      className={`flex w-full items-center gap-2 lg:gap-3 px-4 lg:px-7 py-[11px] transition-all cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
      onClick={handleLogoutClick} 
      disabled={isLoading}
      aria-label="Logout button"
      style={{
        background: 'rgba(81, 81, 80, 0.60)',
      }}
    >
      <Image
        className="w-[22px] shrink-0"
        src="/logout.svg"
        alt="Sign out Icon"
        width={22}
        height={22}
        style={{ height: 'auto' }}
      />
      <span className="text-base desktop:text-lg text-off-white-3 font-medium font-geist">
        {isLoading ? 'Signing out...' : 'Sign out'}
      </span>
    </button>
  )
}

export default LogoutButton
