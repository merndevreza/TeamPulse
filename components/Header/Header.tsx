import MyProfileLink from './MyProfileLink';
import NotificationsWrapper from './NotificationsWrapper';

const Header = () => {

   return (
      <header className='max-sm:hidden flex bg-background-grey h-[37px] desktop:h-[55px] px-3.5 desktop:px-7 items-center justify-end sticky top-0 left-0 w-full z-10'>
         <div className='flex gap-2 items-center'>
            <NotificationsWrapper />
            <MyProfileLink />
         </div>
      </header>
   );
};

export default Header;