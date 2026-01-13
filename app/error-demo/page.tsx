'use client'
import Button from "@/components/Button";

export default function ErrorDemo() {
   const handleTriggerError = () => {
      throw new Error('This is a demo error!')
   }

   return (
      <main
         className="flex flex-col justify-center items-center gap-4 lg:gap-9 py-5 h-screen overflow-x-hidden bg-dark-black text-off-white"
      >
         <h1 className="font-semibold text-2xl sm:text-4xl lg:text-5xl desktop:text-6xl">
            Error Demo Page
         </h1>
         <p className="font-geist text-lg desktop:text-xl text-center max-w-3/4">
            Click the button below to trigger an error and see the error boundary in action.
         </p>
         <Button text="Trigger Error" onClick={handleTriggerError} variant="secondary" className="error-home-btn" />
      </main>
   )
}