"use client";
import React from 'react';
import LoginForm from './LoginForm';
import ForgetPasswordForm from './ForgetPasswordForm'; 

const LoginForgetWrapper = () => {
   const [isLogin, setIsLogin] = React.useState(true);
   return (
     <section className={`bg-off-white flex flex-col justify-center items-center max-sm:rounded-[10px] rounded-[20px] w-full max-sm:max-w-[343px] max-w-[577px] h-full max-h-[652px] ${isLogin ? 'max-sm:max-h-[500px] ' : 'max-sm:max-h-[450px] '}`}>
         <div className='flex justify-center items-center max-sm:w-21 max-sm:h-21 w-28 h-28 lg:w-[130px] lg:h-[130px] rounded-full bg-light-grey-2 max-sm:mb-6 mb-9 mt-[52px]'>
            <h1 className='lexaeon-font max-sm:text-lg text-2xl text-[#D4644E]'>Lexaeon</h1>
         </div>
         <p className={` text-[20px] font-medium mb-9 ${isLogin ? "max-sm:mb-6 text-dark-black max-sm:text-[28px]" : " text-dark-grey-4 max-sm:text-[20px] max-sm:mb-3"}`}>{isLogin ? "Log in" : "Forgot password?"}</p>
         {isLogin ? <LoginForm /> : <ForgetPasswordForm setIsLogin={setIsLogin} />}
         <button className='mt-2 cursor-pointer text-dark-grey-4 text-[15px]' onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Forgot password?" : "Back to login"}
         </button>
      </section>
   );
};

export default LoginForgetWrapper;