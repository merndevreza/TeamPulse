import Navigation from './Navigation'
import { cn } from '@/utils/cn'
import LogoutButton from './Logout'
import GiveDotButton from './GiveDotButton';

type SidebarProps = {
  className?: string
}

const Sidebar = ({ className }: SidebarProps) => {

  return (
    <aside className={cn(`max-sm:hidden bg-light-black border-r border-light-grey-2 pb-4 pt-5 desktop:pt-6 desktop:pb-6 w-[209px] desktop:w-[245px] flex flex-col h-screen sticky top-0 left-0 ${className}`)} aria-label="Sidebar">
      <p className='text-xl desktop:text-2xl lexaeon-font block text-center mb-6.5 font-normal'><span className='text-off-white'>Lexaeon </span><span className='text-light-orange'>DOTS</span></p>
      <div className="mb-5.5 mt-1.5 desktop:mt-6 px-7 desktop:px-[22px]">
        <GiveDotButton />
      </div>
      <div className="flex-1">
        <Navigation />
      </div>
      <LogoutButton />
    </aside>
  )
}

export default Sidebar
